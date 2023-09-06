package main

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/rtfpessoa/timer-tamer/logger"
	"go.uber.org/zap"

	goauth "google.golang.org/api/oauth2/v2"
)

const (
	redirectURL = "https://roodle.onrender.com/auth/google/callback"
	credFile    = "clientid.google.json"
	sessionName = "gin_session"
)

var (
	scopes       = []string{"https://www.googleapis.com/auth/userinfo.email"}
	cookieSecret []byte
)

func main() {
	ConfigRuntime()
	err := StartServer()
	if err != nil {
		logger.Error("server failed", zap.Error(err))
	}
}

func ConfigRuntime() {
	numCPU := runtime.NumCPU()
	runtime.GOMAXPROCS(numCPU)
	logger.Infof("Running with %d CPUs", numCPU)
}

func StartServer() error {
	ctx := context.Background()
	gin.SetMode(gin.ReleaseMode)

	cookieSecretStr := os.Getenv("COOKIE_SECRET")
	if cookieSecretStr == "" {
		return errors.New("missing COOKIE_SECRET environment variable")
	}
	cookieSecret = []byte(cookieSecretStr)

	db, err := NewDB(ctx)
	if err != nil {
		return err
	}
	defer db.Close()

	apiServer := NewAPIServer(db)

	err = Setup(redirectURL, credFile, scopes, cookieSecret)
	if err != nil {
		return err
	}

	router := gin.New()
	router.Use(gin.CustomRecovery(func(c *gin.Context, err any) {
		logger.Error("recovery from panic", zap.Any("error", err))
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "An unexpected error occurred"})
	}))
	router.Use(Session(sessionName))

	router.LoadHTMLGlob("resources/*.html")
	router.Static("/static", "resources/static")
	router.StaticFile("/favicon.ico", "resources/favicon.ico")
	router.StaticFile("/logo192.png", "resources/logo192.png")
	router.StaticFile("/logo512.png", "resources/logo512.png")
	router.StaticFile("/manifest.json", "resources/manifest.json")
	router.StaticFile("/asset-manifest.json", "resources/asset-manifest.json")
	router.StaticFile("/robots.txt", "resources/robots.txt")
	router.NoRoute(index)
	router.GET("/", index)
	router.GET("/login", LoginHandler)
	router.GET("/logout", LogoutHandler)

	authRouter := router.Group("/auth")
	authRouter.Use(Auth())
	authRouter.Use(AuthMiddleware(db))
	authRouter.GET("/google/callback", apiServer.googleCallback)

	apiV1Router := router.Group("/api")
	apiV1Router.Use(Auth())
	apiV1Router.Use(AuthMiddleware(db))
	apiV1Router.GET("/v1/me", WithAccountID(apiServer.userInfo))
	apiV1Router.GET("/v1/poll", WithAccountID(apiServer.listPolls))
	apiV1Router.POST("/v1/poll", WithAccountID(apiServer.newPoll))
	apiV1Router.GET("/v1/poll/:id", apiServer.getPoll)
	apiV1Router.DELETE("/v1/poll/:id", WithAccountID(apiServer.deletePoll))
	apiV1Router.POST("/v1/poll/:id/vote", WithAccountID(apiServer.newVote))
	apiV1Router.GET("/v1/poll/:id/vote", WithAccountID(apiServer.getVote))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal)
	// kill (no param) default send syscanll.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall. SIGKILL but can"t be catch, so don't need add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("failed to shutdown server", zap.Error(err))
		return err
	}

	select {
	case <-ctx.Done():
		logger.Error("shutdown server timeout")
	}
	logger.Info("server shutdown successfully")

	return nil
}

func index(c *gin.Context) {
	c.Status(http.StatusOK)
	c.HTML(http.StatusOK, "index.html", nil)
}

const ACCOUNT_ID_KEY = "ACCOUNT_ID"

const SESSION_ACCOUNT_ID = "roodle-user"

func AuthMiddleware(db *sql.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)

		existingSession := session.Get(SESSION_ACCOUNT_ID)
		if accountID, ok := existingSession.(int64); ok {
			ctx.Set(ACCOUNT_ID_KEY, accountID)
			ctx.Next()
			return
		}

		var (
			res goauth.Userinfo
			ok  bool
		)
		if res, ok = ctx.Value("user").(goauth.Userinfo); !ok {
			logger.Error("failed to retrieve user info")
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve user info"})
			return
		}

		account := Account{
			Email:    res.Email,
			Name:     res.Name,
			Username: strings.Split(res.Email, "@")[0],
		}

		accountID, err := GetAccount(ctx, db, account.Email)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve account"})
			return
		}
		if accountID == -1 {
			account, err := NewAccount(ctx, db, account)
			if err != nil {
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to create account"})
				return
			}
			accountID = account.ID
		}

		ctx.Set(ACCOUNT_ID_KEY, accountID)

		session.Set(SESSION_ACCOUNT_ID, accountID)
		if err := session.Save(); err != nil {
			logger.Error("failed to save session", zap.Error(err))
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to save session"})
			return
		}

		ctx.Next()
	}
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
