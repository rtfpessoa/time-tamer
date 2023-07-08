package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"

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

	router := gin.New()
	router.Use(gin.Recovery())
	router.LoadHTMLGlob("resources/*.html")
	router.Static("/static", "resources/static")
	router.StaticFile("/favicon.ico", "resources/favicon.ico")
	router.StaticFile("/logo192.png", "resources/logo192.png")
	router.StaticFile("/logo512.png", "resources/logo512.png")
	router.StaticFile("/manifest.json", "resources/manifest.json")
	router.StaticFile("/asset-manifest.json", "resources/asset-manifest.json")
	router.StaticFile("/robots.txt", "resources/robots.txt")
	router.GET("/", index)
	router.GET("/api", api)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := router.Run(":" + port); err != nil {
		log.Panicf("error: %s", err)
	}
}

func index(c *gin.Context) {
	c.Status(http.StatusOK)
	c.HTML(http.StatusOK, "index.html", nil)
}

type response struct {
	Data string `json:"data"`
}

func api(c *gin.Context) {
	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: "Hello World!"})
}
