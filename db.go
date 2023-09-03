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

	_, err = db.ExecContext(ctx, `DROP TABLE IF EXISTS "accounts";`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS "accounts" (
		"id"       BIGSERIAL NOT NULL,
		"email"    TEXT      NOT NULL,
		"username" TEXT      NOT NULL,
		"name"     TEXT      NOT NULL,
		PRIMARY KEY(id)
	);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.ExecContext(ctx, `DROP TABLE IF EXISTS "poll_account_availability";`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS "poll_account_availability" (
		"poll_id"        VARCHAR(12) NOT NULL,
		"account_id"     BIGSERIAL   NOT NULL,
		"availabilities" JSONB       NOT NULL,
		CONSTRAINT fk_poll_id
			FOREIGN KEY(poll_id) 
			REFERENCES polls(id)
			ON DELETE CASCADE,
		CONSTRAINT fk_account_id
			FOREIGN KEY(account_id) 
			REFERENCES accounts(id)
			ON DELETE CASCADE,
	);`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.ExecContext(ctx, `DROP TABLE IF EXISTS "polls";`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS "polls" (
		"id"          VARCHAR(12) NOT NULL,
		"account_id"  BIGSERIAL   NOT NULL,
		"title"       TEXT        NOT NULL,
		"description" TEXT        NOT NULL,
		"location"    TEXT        NOT NULL,
		"options"     JSONB       NOT NULL,
		PRIMARY KEY(id),
		CONSTRAINT fk_account_id
			FOREIGN KEY(account_id) 
			REFERENCES accounts(id)
			ON DELETE CASCADE,
	);`)
	if err != nil {
		log.Fatal(err)
	}
}

func NewAccount(ctx context.Context, db *sql.DB, account Account) (int64, error) {
	sqlStatement := `
INSERT INTO poll_account_availability (email, username, name)
VALUES ($1, $2, $3);`
	var accountID int64
	err := db.QueryRowContext(ctx, sqlStatement, account.Email, account.Username, account.Name).Scan(&accountID)
	if err != nil {
		log.Fatal(err)
	}

	return accountID, nil
}

func NewPoll(ctx context.Context, db *sql.DB, accountID int64, poll Poll) (Poll, error) {
	pollID := randomAlphanumeric(12)
	poll.ID = pollID

	sqlStatement := `
INSERT INTO polls (poll_id, account_id, title, description, location, options)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;`
	marshaledOptions, err := json.Marshal(poll.Options)
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.ExecContext(ctx, sqlStatement, poll.ID, accountID, poll.Title, poll.Description, poll.Location, string(marshaledOptions))
	if err != nil {
		log.Fatal(err)
	}

	return poll, nil
}

func GetPoll(ctx context.Context, db *sql.DB, pollID string) (Poll, error) {
	sqlStatement := `SELECT title, description, location, jsonb_pretty(options) AS options
		FROM polls
		WHERE id = $1;`

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
	err = rows.Scan(&title, &description, &location, &options)
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	pollOptions := []PollOption{}
	err = json.Unmarshal([]byte(options), &pollOptions)
	if err != nil {
		log.Fatal(err)
	}

	return Poll{
		ID: pollID,
		PollBase: PollBase{
			Title:       title,
			Description: description,
			Location:    location,
			Options:     pollOptions,
		},
	}, nil
}

func ListPolls(ctx context.Context, db *sql.DB, accountID int64) ([]Poll, error) {
	sqlStatement := `SELECT id, title, description, location, jsonb_pretty(options) AS options
		FROM polls
		WHERE account_id = $1;`

	var id string
	var title string
	var description string
	var location string
	var options string
	rows, err := db.QueryContext(ctx, sqlStatement, accountID)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	polls := []Poll{}
	for rows.Next() {
		err = rows.Scan(&id, &title, &description, &location, &options)
		if err := rows.Err(); err != nil {
			log.Fatal(err)
		}

		pollOptions := []PollOption{}
		err = json.Unmarshal([]byte(options), &pollOptions)
		if err != nil {
			log.Fatal(err)
		}

		polls = append(polls, Poll{
			ID: id,
			PollBase: PollBase{
				Title:       title,
				Description: description,
				Location:    location,
				Options:     pollOptions,
			},
		})
	}

	return polls, nil
}

func DeletePoll(ctx context.Context, db *sql.DB, accountID int64, pollID string) (Poll, error) {
	sqlStatement := `
	DELETE FROM polls
	WHERE account_id = $1 AND id = $2
	RETURNING (title, description, location, options);`

	var title string
	var description string
	var location string
	var options string
	rows, err := db.QueryContext(ctx, sqlStatement, accountID, pollID)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	exists := rows.Next()
	if !exists {
		return Poll{}, nil
	}
	err = rows.Scan(&title, &description, &location, &options)
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	pollOptions := []PollOption{}
	err = json.Unmarshal([]byte(options), &pollOptions)
	if err != nil {
		log.Fatal(err)
	}

	return Poll{
		ID: pollID,
		PollBase: PollBase{
			Title:       title,
			Description: description,
			Location:    location,
			Options:     pollOptions,
		},
	}, nil
}

func NewVote(ctx context.Context, db *sql.DB, accountID int64, vote PollAccountAvailability) error {
	sqlStatement := `
INSERT INTO poll_account_availability (account_id, poll_id, availabilities)
VALUES ($1, $2, $3);`
	marshaledAvailabilities, err := json.Marshal(vote.Availabilities)
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.ExecContext(ctx, sqlStatement, accountID, vote.PollID, marshaledAvailabilities)
	if err != nil {
		log.Fatal(err)
	}

	return nil
}

func GetVote(ctx context.Context, db *sql.DB, accountID int64, pollID string) (PollAccountAvailability, error) {
	sqlStatement := `SELECT jsonb_pretty(availabilities) AS availabilities
		FROM poll_account_availability
		WHERE account_id = $1 AND poll_id = $2;`

	var availabilities string
	rows, err := db.QueryContext(ctx, sqlStatement, accountID, pollID)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	exists := rows.Next()
	if !exists {
		return PollAccountAvailability{}, nil
	}
	err = rows.Scan(&availabilities)
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	optionAvailabilities := []OptionAvailability{}
	err = json.Unmarshal([]byte(availabilities), &optionAvailabilities)
	if err != nil {
		log.Fatal(err)
	}

	return PollAccountAvailability{
		PollID:         pollID,
		AccountID:      accountID,
		Availabilities: optionAvailabilities,
	}, nil
}

func ListVotes(ctx context.Context, db *sql.DB, pollID string) ([]PollAccountAvailability, error) {
	sqlStatement := `SELECT jsonb_pretty(availabilities) AS availabilities
		FROM poll_account_availability
		WHERE poll_id = $1;`

	rows, err := db.QueryContext(ctx, sqlStatement, pollID)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	pollAccountAvailabilities := []PollAccountAvailability{}
	for rows.Next() {
		var availabilities string
		err = rows.Scan(&availabilities)
		if err := rows.Err(); err != nil {
			log.Fatal(err)
		}

		pollAccountAvailability := PollAccountAvailability{}
		err = json.Unmarshal([]byte(availabilities), &pollAccountAvailability)
		if err != nil {
			log.Fatal(err)
		}

		pollAccountAvailabilities = append(pollAccountAvailabilities, pollAccountAvailability)
	}

	return pollAccountAvailabilities, nil
}
