package main

import (
	"math/rand"
)

const (
	charset    = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	charsetLen = len(charset)
)

func randomAlphanumeric(length int) string {
	result := make([]byte, length)

	for i := 0; i < length; i++ {
		result[i] = charset[rand.Intn(charsetLen)]
	}

	return string(result)
}
