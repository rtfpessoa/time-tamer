package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"

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

func (a *APIServer) newAccount(c *gin.Context) {
	jsonData, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	account := Account{}
	err = json.Unmarshal(jsonData, &account)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	id, err := NewAccount(c.Request.Context(), a.db, account)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: id})
}

func (a *APIServer) newPoll(c *gin.Context) {
	accountID, err := GetAccountID(c.Request.Context())
	if err != nil {
		log.Panicf("error: %s", err)
	}

	jsonData, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	poll := Poll{}
	err = json.Unmarshal(jsonData, &poll)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	id, err := NewPoll(c.Request.Context(), a.db, accountID, poll)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: id})
}

func (a *APIServer) listPolls(c *gin.Context) {
	accountID, err := GetAccountID(c.Request.Context())
	if err != nil {
		log.Panicf("error: %s", err)
	}

	polls, err := ListPolls(c.Request.Context(), a.db, accountID)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: polls})
}

func (a *APIServer) getPoll(c *gin.Context) {
	pollID := c.Params.ByName("id")

	log.Printf("PollID: %s\n", pollID)
	poll, err := GetPoll(c.Request.Context(), a.db, pollID)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	availabilities, err := ListVotes(c.Request.Context(), a.db, pollID)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: map[string]interface{}{
		"poll":           poll,
		"availabilities": availabilities,
	}})
}

func (a *APIServer) deletePoll(c *gin.Context) {
	accountID, err := GetAccountID(c.Request.Context())
	if err != nil {
		log.Panicf("error: %s", err)
	}

	pollID := c.Params.ByName("id")

	poll, err := DeletePoll(c.Request.Context(), a.db, accountID, pollID)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: poll})
}

func (a *APIServer) newVote(c *gin.Context) {
	accountID, err := GetAccountID(c.Request.Context())
	if err != nil {
		log.Panicf("error: %s", err)
	}

	pollID := c.Params.ByName("id")

	jsonData, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	availabilities := []OptionAvailability{}
	err = json.Unmarshal(jsonData, &availabilities)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	err = NewVote(c.Request.Context(), a.db, accountID, PollAccountAvailability{
		PollID:         pollID,
		AccountID:      1,
		Availabilities: availabilities,
	})
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: nil})
}

func (a *APIServer) getVote(c *gin.Context) {
	accountID, err := GetAccountID(c.Request.Context())
	if err != nil {
		log.Panicf("error: %s", err)
	}

	pollID := c.Params.ByName("id")

	log.Printf("PollID: %s\n", pollID)
	pollAccountAvailability, err := GetVote(c.Request.Context(), a.db, accountID, pollID)
	if err != nil {
		log.Panicf("error: %s", err)
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "application/json")
	c.JSON(200, response{Data: pollAccountAvailability})
}
