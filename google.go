// Package google provides you access to Google's OAuth2
// infrastructure. The implementation is based on this blog post:
// http://skarlso.github.io/2016/06/12/google-signin-with-go/
package main

import (
	"encoding/gob"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/rtfpessoa/timer-tamer/logger"
	"go.uber.org/zap"
	goauth "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// Credentials stores google client-ids.
type Credentials struct {
	ClientID     string `json:"clientid"`
	ClientSecret string `json:"secret"`
}

const (
	stateKey    = "state"
	redirectKey = "redirect"
	sessionID   = "ginoauth_google_session"
)

var (
	conf  *oauth2.Config
	store sessions.Store
)

func init() {
	gob.Register(goauth.Userinfo{})
}

func Setup(redirectURL, credFile string, scopes []string, secret []byte) error {
	store = cookie.NewStore(secret)

	var c Credentials
	file, err := os.ReadFile(credFile)
	if err != nil {
		logger.Error("failed to read oauth credentials file", zap.Error(err))
		return err
	}
	if err := json.Unmarshal(file, &c); err != nil {
		logger.Error("failed to unmarshal oauth credentials file", zap.Error(err))
		return err
	}

	conf = &oauth2.Config{
		ClientID:     c.ClientID,
		ClientSecret: c.ClientSecret,
		RedirectURL:  redirectURL,
		Scopes:       scopes,
		Endpoint:     google.Endpoint,
	}

	return nil
}

func Session(name string) gin.HandlerFunc {
	return sessions.Sessions(name, store)
}

func LoginHandler(ctx *gin.Context) {
	session := sessions.Default(ctx)

	from := ctx.Request.URL.Query().Get("from")
	if from != "" && strings.HasPrefix(from, "/") {
		session.Set(redirectKey, from)
	} else {
		logger.Warn("invalid from parameter", zap.String("from", from))
	}

	stateValue := randomAlphanumeric(12)
	session.Set(stateKey, stateValue)

	if err := session.Save(); err != nil {
		logger.Error("failed to save session", zap.Error(err))
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to save session"})
		return
	}

	url := GetLoginURL(stateValue)
	ctx.Redirect(http.StatusFound, url)
	return
}

func LogoutHandler(ctx *gin.Context) {
	session := sessions.Default(ctx)

	session.Delete(sessionID)
	session.Delete(SESSION_ACCOUNT_ID)

	if err := session.Save(); err != nil {
		logger.Error("failed to save session", zap.Error(err))
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to save session"})
		return
	}

	ctx.Redirect(http.StatusFound, "/")
	return
}

func GetLoginURL(state string) string {
	return conf.AuthCodeURL(state)
}

// Auth is the google authorization middleware. You can use them to protect a routergroup.
// Example:
//
//	       private.Use(google.Auth())
//	       private.GET("/", UserInfoHandler)
//	       private.GET("/api", func(ctx *gin.Context) {
//	           ctx.JSON(200, gin.H{"message": "Hello from private for groups"})
//	       })
//
//	   // Requires google oauth pkg to be imported as `goauth "google.golang.org/api/oauth2/v2"`
//	   func UserInfoHandler(ctx *gin.Context) {
//		      var (
//		      	res goauth.Userinfo
//		      	ok  bool
//		      )
//
//		      val := ctx.MustGet("user")
//		      if res, ok = val.(goauth.Userinfo); !ok {
//		      	res = goauth.Userinfo{Name: "no user"}
//		      }
//
//		      ctx.JSON(http.StatusOK, gin.H{"Hello": "from private", "user": res.Email})
//	   }
func Auth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Handle the exchange code to initiate a transport.
		session := sessions.Default(ctx)

		existingSession := session.Get(sessionID)
		if userInfo, ok := existingSession.(goauth.Userinfo); ok {
			ctx.Set("user", userInfo)
			ctx.Next()
			return
		}

		retrievedState := session.Get(stateKey)
		if retrievedState != ctx.Query(stateKey) {
			logger.Error("invalid session state")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid state"})
			return
		}

		tok, err := conf.Exchange(ctx, ctx.Query("code"))
		if err != nil {
			logger.Error("failed to exchange code for oauth token", zap.Error(err))
			ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "failed to exchange code for oauth token"})
			return
		}

		oAuth2Service, err := goauth.NewService(ctx, option.WithTokenSource(conf.TokenSource(ctx, tok)))
		if err != nil {
			logger.Error("failed to create oauth service", zap.Error(err))
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to create oauth service"})
			return
		}

		userInfo, err := oAuth2Service.Userinfo.Get().Do()
		if err != nil {
			logger.Error("failed to get user info", zap.Error(err))
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to get user info"})
			return
		}

		ctx.Set("user", *userInfo)

		session.Set(sessionID, *userInfo)
		if err := session.Save(); err != nil {
			logger.Error("failed to save session", zap.Error(err))
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to save session"})
			return
		}
	}
}

func GetUserinfo(ctx *gin.Context) (goauth.Userinfo, error) {
	session := sessions.Default(ctx)

	existingSession := session.Get(sessionID)
	if userInfo, ok := existingSession.(goauth.Userinfo); ok {
		return userInfo, nil
	}

	return goauth.Userinfo{}, fmt.Errorf("no user found")
}
