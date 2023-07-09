package main

import "time"

type PollOption struct {
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

type Poll struct {
	ID          int64        `json:"id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Location    string       `json:"location"`
	Options     []PollOption `json:"options"`
}
