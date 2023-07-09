package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func NewDB() (*sql.DB, error) {
	sqlDB, err := sql.Open("postgres", os.Getenv("DATABASE_URL")+"&application_name=time-tamer")
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	ctx := context.Background()
	prepareDB(ctx, sqlDB)

	return sqlDB, nil
}

func prepareDB(ctx context.Context, db *sql.DB) {
	var err error

	// _, err = db.ExecContext(ctx, `DROP TABLE IF EXISTS "polls";`)
	// if err != nil {
	// 	log.Fatal(err)
	// }

	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS "polls" (
		"id" BIGSERIAL PRIMARY KEY,
		"title" TEXT NOT NULL,
		"description" TEXT NOT NULL,
		"location" TEXT NOT NULL,
		"options" JSONB NOT NULL
	);`)
	if err != nil {
		log.Fatal(err)
	}
}

func NewPoll(ctx context.Context, db *sql.DB, poll Poll) (int64, error) {
	sqlStatement := `
INSERT INTO polls (title, description, location, options)
VALUES ($1, $2, $3, $4)
RETURNING id;`
	marshaledOptions, err := json.Marshal(poll.Options)
	if err != nil {
		log.Fatal(err)
	}
	var pollID int64
	err = db.QueryRowContext(ctx, sqlStatement, poll.Title, poll.Description, poll.Location, string(marshaledOptions)).Scan(&pollID)
	if err != nil {
		log.Fatal(err)
	}

	return pollID, nil
}

func GetPoll(ctx context.Context, db *sql.DB, pollID int64) (Poll, error) {
	sqlStatement := `SELECT id, title, description, location, jsonb_pretty(options) AS options FROM polls WHERE id = $1;`

	var id int64
	var title string
	var description string
	var location string
	var options string
	rows, err := db.QueryContext(ctx, sqlStatement, pollID)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	exists := rows.Next()
	if !exists {
		return Poll{}, nil
	}
	err = rows.Scan(&id, &title, &description, &location, &options)
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	pollOptions := []PollOption{}
	err = json.Unmarshal([]byte(options), &pollOptions)
	if err != nil {
		log.Fatal(err)
	}

	return Poll{
		ID:          id,
		Title:       title,
		Description: description,
		Location:    location,
		Options:     pollOptions,
	}, nil
}
