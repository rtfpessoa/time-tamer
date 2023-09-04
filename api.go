package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/rtfpessoa/timer-tamer/logger"
	"go.uber.org/zap"
	"golang.org/x/exp/slices"
	goauth "google.golang.org/api/oauth2/v2"
)

type APIServer struct {
	db *sql.DB
}

func NewAPIServer(db *sql.DB) APIServer {
	return APIServer{
		db: db,
	}
}

type response struct {
	Data interface{} `json:"data"`
}

func (a *APIServer) userInfo(ctx *gin.Context, accountID int64) {
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
	jsonData, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		logger.Error("failed to read request body")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	poll := Poll{}
	err = json.Unmarshal(jsonData, &poll)
	if err != nil {
		logger.Error("failed to parse request body", zap.String("body", string(jsonData)), zap.Any("error", err))
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	createdPoll, err := NewPoll(ctx, a.db, accountID, poll)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}

	ctx.Status(http.StatusOK)
	ctx.Header("Content-Type", "application/json")
	ctx.JSON(200, response{Data: createdPoll})
}

func (a *APIServer) listPolls(ctx *gin.Context, accountID int64) {
	polls, err := ListPolls(ctx, a.db, accountID)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}

	ctx.Status(http.StatusOK)
	ctx.Header("Content-Type", "application/json")
	ctx.JSON(200, response{Data: polls})
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

	ctx.Status(http.StatusOK)
	ctx.Header("Content-Type", "application/json")
	ctx.JSON(200, response{Data: map[string]interface{}{
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

	ctx.Status(http.StatusOK)
	ctx.Header("Content-Type", "application/json")
	ctx.JSON(200, response{Data: poll})
}

func (a *APIServer) newVote(ctx *gin.Context, accountID int64) {
	pollID := ctx.Params.ByName("id")
	if pollID == "" {
		logger.Error("invalid poll id")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid poll id"})
		return
	}

	jsonData, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		logger.Error("failed to read request body")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	availabilities := []OptionAvailability{}
	err = json.Unmarshal(jsonData, &availabilities)
	if err != nil {
		logger.Error("failed to parse request body", zap.String("body", string(jsonData)), zap.Any("error", err))
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
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

	ctx.Status(http.StatusOK)
	ctx.Header("Content-Type", "application/json")
	ctx.JSON(200, response{Data: pollAccountAvailability})
}

func (a *APIServer) getVote(ctx *gin.Context, accountID int64) {
	pollID := ctx.Params.ByName("id")
	if pollID == "" {
		logger.Error("invalid poll id")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid poll id"})
		return
	}

	pollAccountAvailability, err := GetVote(ctx, a.db, accountID, pollID)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
		return
	}

	ctx.Status(http.StatusOK)
	ctx.Header("Content-Type", "application/json")
	ctx.JSON(200, response{Data: pollAccountAvailability})
}
