package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"os"

	_ "github.com/lib/pq"
	"github.com/rtfpessoa/timer-tamer/logger"
	"go.uber.org/zap"
)

func NewDB(ctx context.Context) (*sql.DB, error) {
	sqlDB, err := sql.Open("postgres", os.Getenv("DATABASE_URL")+"&application_name=time-tamer")
	if err != nil {
		logger.Error("failed to open database connection", zap.Error(err))
		return nil, err
	}

	err = prepareDB(ctx, sqlDB)
	if err != nil {
		return nil, err
	}

	return sqlDB, nil
}

func prepareDB(ctx context.Context, db *sql.DB) error {
	var err error

	// _, err = db.ExecContext(ctx, `DROP TABLE IF EXISTS "poll_account_availability";`)
	// if err != nil {
	// 	logger.Error("failed to drop poll_account_availability table", zap.Error(err))
	// 	return err
	// }

	// _, err = db.ExecContext(ctx, `DROP TABLE IF EXISTS "polls";`)
	// if err != nil {
	// 	logger.Error("failed to drop polls table", zap.Error(err))
	// 	return err
	// }

	// _, err = db.ExecContext(ctx, `DROP TABLE IF EXISTS "accounts";`)
	// if err != nil {
	// 	logger.Error("failed to drop accounts table", zap.Error(err))
	// 	return err
	// }

	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS "accounts" (
		"id"       BIGSERIAL NOT NULL,
		"email"    TEXT      NOT NULL,
		"username" TEXT      NOT NULL,
		"name"     TEXT      NOT NULL,
		PRIMARY KEY(id)
	);`)
	if err != nil {
		logger.Error("failed to create accounts table", zap.Error(err))
		return err
	}

	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS "polls" (
		"id"          VARCHAR(12) NOT NULL PRIMARY KEY,
		"account_id"  BIGSERIAL   NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
		"title"       TEXT        NOT NULL,
		"description" TEXT        NOT NULL,
		"location"    TEXT        NOT NULL,
		"options"     JSONB       NOT NULL
	);`)
	if err != nil {
		logger.Error("failed to create polls table", zap.Error(err))
		return err
	}

	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS "poll_account_availability" (
		"poll_id"        VARCHAR(12) NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
		"account_id"     BIGSERIAL   NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
		"availabilities" JSONB       NOT NULL,
		PRIMARY KEY(poll_id, account_id)
	);`)
	if err != nil {
		logger.Error("failed to create poll_account_availability table", zap.Error(err))
		return err
	}

	return nil
}

func NewAccount(ctx context.Context, db *sql.DB, account Account) (Account, error) {
	sqlStatement := `
INSERT INTO accounts (email, username, name)
VALUES ($1, $2, $3)
RETURNING id;`
	var accountID int64
	err := db.QueryRowContext(ctx, sqlStatement, account.Email, account.Username, account.Name).Scan(&accountID)
	if err != nil {
		logger.Error("failed to create account", zap.Error(err))
		return Account{}, err
	}

	account.ID = accountID

	return account, nil
}

func GetAccount(ctx context.Context, db *sql.DB, accountEmail string) (int64, error) {
	var accountID int64
	err := db.
		QueryRowContext(ctx, "SELECT id FROM accounts WHERE email = $1", accountEmail).
		Scan(&accountID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			logger.Debugf("no account found for email %s\n", accountEmail)
			return -1, nil
		}

		logger.Error("failed to retrieve account", zap.Error(err))
		return -1, err
	}

	return accountID, nil
}

func NewPoll(ctx context.Context, db *sql.DB, accountID int64, poll Poll) (Poll, error) {
	poll.ID = randomAlphanumeric(12)

	sqlStatement := `
INSERT INTO polls (id, account_id, title, description, location, options)
VALUES ($1, $2, $3, $4, $5, $6);`

	for idx := range poll.Options {
		poll.Options[idx].ID = randomAlphanumeric(12)
	}

	marshaledOptions, err := json.Marshal(poll.Options)
	if err != nil {
		logger.Error("failed to marshal poll options", zap.Error(err))
		return Poll{}, err
	}
	_, err = db.ExecContext(ctx, sqlStatement, poll.ID, accountID, poll.Title, poll.Description, poll.Location, string(marshaledOptions))
	if err != nil {
		logger.Error("failed to create poll", zap.Error(err))
		return Poll{}, err
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
		logger.Error("failed to retrieve poll", zap.Error(err))
		return Poll{}, err
	}
	defer rows.Close()

	exists := rows.Next()
	if !exists {
		logger.Debugf("no poll found for id %s\n", pollID)
		return Poll{}, nil
	}
	err = rows.Scan(&title, &description, &location, &options)
	if err := rows.Err(); err != nil {
		logger.Error("failed to read poll fields", zap.Error(err))
		return Poll{}, err
	}

	pollOptions := []PollOption{}
	err = json.Unmarshal([]byte(options), &pollOptions)
	if err != nil {
		logger.Error("failed to unmarshal poll options", zap.Error(err))
		return Poll{}, err
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
		logger.Error("failed to retrieve polls", zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	polls := []Poll{}
	for rows.Next() {
		err = rows.Scan(&id, &title, &description, &location, &options)
		if err := rows.Err(); err != nil {
			logger.Error("failed to read poll fields", zap.Error(err))
			continue
		}

		pollOptions := []PollOption{}
		err = json.Unmarshal([]byte(options), &pollOptions)
		if err != nil {
			logger.Error("failed to unmarshal poll options", zap.Error(err))
			continue
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
		logger.Error("failed to delete poll", zap.Error(err))
		return Poll{}, err
	}
	defer rows.Close()

	exists := rows.Next()
	if !exists {
		logger.Debugf("no poll found for id %s\n", pollID)
		return Poll{}, nil
	}
	err = rows.Scan(&title, &description, &location, &options)
	if err := rows.Err(); err != nil {
		logger.Error("failed to read poll fields", zap.Error(err))
		return Poll{}, err
	}

	pollOptions := []PollOption{}
	err = json.Unmarshal([]byte(options), &pollOptions)
	if err != nil {
		logger.Error("failed to unmarshal poll options", zap.Error(err))
		return Poll{}, err
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

func NewVote(ctx context.Context, db *sql.DB, accountID int64, vote PollAccountAvailability) (PollAccountAvailability, error) {
	sqlStatement := `
INSERT INTO poll_account_availability (account_id, poll_id, availabilities)
VALUES ($1, $2, $3);`
	marshaledAvailabilities, err := json.Marshal(vote.Availabilities)
	if err != nil {
		logger.Error("failed to marshal vote availabilities", zap.Error(err))
		return PollAccountAvailability{}, err
	}
	_, err = db.ExecContext(ctx, sqlStatement, accountID, vote.PollID, marshaledAvailabilities)
	if err != nil {
		logger.Error("failed to create vote", zap.Error(err))
		return PollAccountAvailability{}, err
	}

	vote.AccountID = accountID

	return vote, nil
}

func GetVote(ctx context.Context, db *sql.DB, accountID int64, pollID string) (PollAccountAvailability, error) {
	sqlStatement := `SELECT jsonb_pretty(availabilities) AS availabilities
		FROM poll_account_availability
		WHERE account_id = $1 AND poll_id = $2;`

	var availabilities string
	rows, err := db.QueryContext(ctx, sqlStatement, accountID, pollID)
	if err != nil {
		logger.Error("failed to retrieve vote", zap.Error(err))
		return PollAccountAvailability{}, err
	}
	defer rows.Close()

	exists := rows.Next()
	if !exists {
		logger.Debugf("no vote found for account %d and poll %s\n", accountID, pollID)
		return PollAccountAvailability{}, nil
	}
	err = rows.Scan(&availabilities)
	if err := rows.Err(); err != nil {
		logger.Error("failed to read vote fields", zap.Error(err))
		return PollAccountAvailability{}, err
	}

	optionAvailabilities := []OptionAvailability{}
	err = json.Unmarshal([]byte(availabilities), &optionAvailabilities)
	if err != nil {
		logger.Error("failed to unmarshal vote availabilities", zap.Error(err))
		return PollAccountAvailability{}, err
	}

	return PollAccountAvailability{
		PollID:         pollID,
		AccountID:      accountID,
		Availabilities: optionAvailabilities,
	}, nil
}

func ListVotes(ctx context.Context, db *sql.DB, pollID string) ([]PollAccountAvailability, error) {
	sqlStatement := `SELECT account_id, jsonb_pretty(availabilities) AS availabilities
		FROM poll_account_availability
		WHERE poll_id = $1;`

	rows, err := db.QueryContext(ctx, sqlStatement, pollID)
	if err != nil {
		logger.Error("failed to retrieve votes", zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	pollAccountAvailabilities := []PollAccountAvailability{}
	for rows.Next() {
		var accountID int64
		var availabilities string
		err = rows.Scan(&accountID, &availabilities)
		if err := rows.Err(); err != nil {
			logger.Error("failed to read vote fields", zap.Error(err))
			continue
		}

		optionAvailabilities := []OptionAvailability{}
		err = json.Unmarshal([]byte(availabilities), &optionAvailabilities)
		if err != nil {
			logger.Error("failed to unmarshal vote availabilities", zap.Error(err))
			continue
		}

		pollAccountAvailabilities = append(pollAccountAvailabilities, PollAccountAvailability{
			PollID:         pollID,
			AccountID:      accountID,
			Availabilities: optionAvailabilities,
		})
	}

	return pollAccountAvailabilities, nil
}
