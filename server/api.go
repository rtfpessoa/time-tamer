package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/rtfpessoa/roodle/server/logger"
	"go.uber.org/zap"
	"golang.org/x/exp/slices"
	goauth "google.golang.org/api/oauth2/v2"
)

const (
	MAX_POLLS_PER_ACCOUNT = 1000
)

type APIServer struct {
	db *sql.DB
}

func NewAPIServer(db *sql.DB) *APIServer {
	return &APIServer{db: db}
}

func (a *APIServer) UserInfo(ctx *gin.Context) {
	WithAccountID(func(ctx *gin.Context, accountID int64) {
		var (
			res goauth.Userinfo
			ok  bool
		)

		if res, ok = ctx.Value("user").(goauth.Userinfo); !ok {
			logger.Error("failed to retrieve user info")
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve user info"})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"id": accountID, "email": res.Email})
	})(ctx)
}

func (a *APIServer) googleCallback(ctx *gin.Context) {
	session := sessions.Default(ctx)
	fromValue := session.Get(redirectKey)

	session.Delete(redirectKey)
	if err := session.Save(); err != nil {
		logger.Warn("failed to save session", zap.Error(err))
	}

	if from, ok := fromValue.(string); ok {
		ctx.Redirect(http.StatusFound, from)
		return
	}

	ctx.Redirect(http.StatusFound, "/")
}

func (a *APIServer) newPoll(ctx *gin.Context, accountID int64) {
	pollsNumber, err := CountPolls(ctx, a.db, accountID)
	if err != nil {
		logger.Error("failed to retrieve poll count", zap.Any("error", err))
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid request payload"})
		return
	}
	if pollsNumber >= MAX_POLLS_PER_ACCOUNT {
		logger.Error("Poll limit reached", zap.Int64("accountID", accountID))
		ctx.AbortWithStatusJSON(http.StatusTeapot, gin.H{"error": fmt.Sprintf("poll limit of %d reached. delete some polls before creating a new one.", MAX_POLLS_PER_ACCOUNT)})
		return
	}

	poll := Poll{}
	err = readBody(ctx, &poll)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	createdPoll, err := NewPoll(ctx, a.db, accountID, poll)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": createdPoll})
}

func (a *APIServer) ListPolls(ctx *gin.Context) {
	WithAccountID(func(ctx *gin.Context, accountID int64) {
		polls, err := ListPolls(ctx, a.db, accountID)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
			return
		}

		ctx.JSON(http.StatusOK, polls)
	})(ctx)
}

func (a *APIServer) getPoll(ctx *gin.Context) {
	pollID := ctx.Params.ByName("id")
	if pollID == "" {
		logger.Error("invalid poll id")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid poll id"})
		return
	}

	poll, err := GetPoll(ctx, a.db, pollID)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}
	if reflect.ValueOf(poll).IsZero() {
		ctx.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "poll not found"})
		return
	}

	availabilities, err := ListVotes(ctx, a.db, pollID)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": map[string]interface{}{
		"poll":           poll,
		"availabilities": availabilities,
	}})
}

func (a *APIServer) deletePoll(ctx *gin.Context, accountID int64) {
	pollID := ctx.Params.ByName("id")
	if pollID == "" {
		logger.Error("invalid poll id")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid poll id"})
		return
	}

	poll, err := DeletePoll(ctx, a.db, accountID, pollID)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": poll})
}

func (a *APIServer) newVote(ctx *gin.Context, accountID int64) {
	pollID := ctx.Params.ByName("id")
	if pollID == "" {
		logger.Error("invalid poll id")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid poll id"})
		return
	}

	availabilities := []OptionAvailability{}
	err := readBody(ctx, &availabilities)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	for _, availability := range availabilities {
		if !slices.Contains(AllOptionAnswer, availability.Answer) {
			logger.Infof("invalid availability %s", availability.Answer)
			ctx.AbortWithStatusJSON(http.StatusBadRequest,
				gin.H{"error": fmt.Sprintf("invalid availability. needs to be one of: %s", strings.Join(AllOptionAnswer, ", "))})
			return
		}
	}

	pollAccountAvailability, err := NewVote(ctx, a.db, accountID, PollAccountAvailability{
		PollID:         pollID,
		AccountID:      accountID,
		Availabilities: availabilities,
	})
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": pollAccountAvailability})
}

func (a *APIServer) getVote(ctx *gin.Context, accountID int64) {
	pollID, err := getPathParam(ctx, "id")
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid parameter id"})
		return
	}

	pollAccountAvailability, err := GetVote(ctx, a.db, accountID, pollID)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": pollAccountAvailability})
}

func WithAccountID(handler func(*gin.Context, int64)) func(*gin.Context) {
	return func(ctx *gin.Context) {
		value := ctx.Value(ACCOUNT_ID_KEY)
		if value == nil {
			logger.Error("missing account id")
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
			return
		}

		if accountID, ok := value.(int64); ok {
			handler(ctx, accountID)
			return
		}

		logger.Error("invalid account id")
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}
}
