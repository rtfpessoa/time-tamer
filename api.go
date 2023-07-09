package main

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
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

func (a *APIServer) newPoll(c *gin.Context) {
	jsonData, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	poll := Poll{}
	err = json.Unmarshal(jsonData, &poll)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	id, err := NewPoll(c.Request.Context(), a.db, poll)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: id})
}

func (a *APIServer) listPolls(c *gin.Context) {
	poll := []Poll{dummyPoll}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: poll})
}

func (a *APIServer) getPoll(c *gin.Context) {
	id := c.Params.ByName("id")
	pollID, err := strconv.ParseInt(id, 0, 64)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	log.Printf("PollID: %d\n", pollID)
	poll, err := GetPoll(c.Request.Context(), a.db, pollID)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: poll})
}

func (a *APIServer) deletePoll(c *gin.Context) {
	id := c.Params.ByName("id")
	pollID, err := strconv.ParseInt(id, 0, 64)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: pollID})
}
