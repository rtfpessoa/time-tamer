package main

import "time"

type OptionAnswer = string

const (
	Available   OptionAnswer = "available"
	Maybe       OptionAnswer = "maybe"
	Unavailable OptionAnswer = "unavailable"
)

type OptionAvailability struct {
	OptionID string       `json:"option_id"`
	Answer   OptionAnswer `json:"answer"`
}

type PollAccountAvailability struct {
	PollID         string               `json:"poll_id"`
	AccountID      int64                `json:"account_id"`
	Availabilities []OptionAvailability `json:"availabilities"`
}

type PollOption struct {
	ID    string    `json:"id"`
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

type PollBase struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Location    string       `json:"location"`
	Options     []PollOption `json:"options"`
}

type Poll struct {
	PollBase
	ID        string `json:"id"`
	AccountID int64  `json:"-"`
}

type Account struct {
	ID       int64  `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Name     string `json:"name"`
}
