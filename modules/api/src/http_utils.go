package main

import (
	"encoding/json"
	"fmt"
	"io"

	"github.com/gin-gonic/gin"
	"github.com/rtfpessoa/roodle/src/logger"
	"go.uber.org/zap"
)

func getPathParam(ctx *gin.Context, key string) (string, error) {
	value := ctx.Params.ByName(key)
	if value == "" {
		logger.Warn("invalid path parameter", zap.String("key", key))
		return "", fmt.Errorf("invalid path parameter")
	}

	return value, nil
}

func readBody(ctx *gin.Context, value interface{}) error {
	jsonData, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		logger.Error("failed to read request body")
		return fmt.Errorf("failed to read request body")
	}

	err = json.Unmarshal(jsonData, value)
	if err != nil {
		logger.Error("failed to parse request body", zap.String("body", string(jsonData)), zap.Any("error", err))
		return fmt.Errorf("failed to parse request body")
	}

	return nil
}
