package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	ConfigRuntime()
	StartGin()
}

// ConfigRuntime sets the number of operating system threads.
func ConfigRuntime() {
	nuCPU := runtime.NumCPU()
	runtime.GOMAXPROCS(nuCPU)
	fmt.Printf("Running with %d CPUs\n", nuCPU)
}

// StartGin starts gin web server with setting router.
func StartGin() {
	gin.SetMode(gin.ReleaseMode)

	db, err := NewDB()
	if err != nil {
		log.Fatal()
	}

	apiServer := NewAPIServer(db)

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(AuthMiddleware())
	router.LoadHTMLGlob("resources/*.html")
	router.Static("/static", "resources/static")
	router.StaticFile("/favicon.ico", "resources/favicon.ico")
	router.StaticFile("/logo192.png", "resources/logo192.png")
	router.StaticFile("/logo512.png", "resources/logo512.png")
	router.StaticFile("/manifest.json", "resources/manifest.json")
	router.StaticFile("/asset-manifest.json", "resources/asset-manifest.json")
	router.StaticFile("/robots.txt", "resources/robots.txt")
	router.GET("/", index)
	router.POST("/api/v1/account", apiServer.newAccount)
	router.GET("/api/v1/poll", apiServer.listPolls)
	router.POST("/api/v1/poll", apiServer.newPoll)
	router.GET("/api/v1/poll/:id", apiServer.getPoll)
	router.DELETE("/api/v1/poll/:id", apiServer.deletePoll)
	router.POST("/api/v1/poll/:id/vote", apiServer.newVote)
	router.GET("/api/v1/poll/:id/vote", apiServer.getVote)

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
			log.Fatalf("listen: %s\n", err)
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
	log.Println("Shutdown Server ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown:", err)
	}
	db.Close()
	// catching ctx.Done(). timeout of 5 seconds.
	select {
	case <-ctx.Done():
		log.Println("timeout of 5 seconds.")
	}
	log.Println("Server exiting")

}

func index(c *gin.Context) {
	c.Status(http.StatusOK)
	c.HTML(http.StatusOK, "index.html", nil)
}

const ACCOUNT_ID_KEY = "ACCOUNT_ID"

const DEFAULT_USER_ID = 1

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(ACCOUNT_ID_KEY, DEFAULT_USER_ID)

		c.Next()
	}
}

func GetAccountID(ctx context.Context) (int64, error) {
	value := ctx.Value(ACCOUNT_ID_KEY)
	if value == nil {
		return -1, errors.New("Missing account in request")
	}

	if v, ok := value.(int64); ok {
		return v, nil
	}

	return -1, errors.New("Wrong account type")
}
