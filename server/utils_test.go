package main

import (
	"fmt"
	"strings"
	"testing"
)

func TestRandomAlphanumeric(t *testing.T) {
	testCases := []int{0, 1, 10, 1000}

	for _, testCaseLength := range testCases {
		t.Run(fmt.Sprintf("Length %d", testCaseLength), func(t *testing.T) {
			result := randomAlphanumeric(testCaseLength)

			if len(result) != testCaseLength {
				t.Errorf("Expected length %d, but got %d", testCaseLength, len(result))
			}

			for _, char := range result {
				if !strings.ContainsRune(charset, char) {
					t.Errorf("Result contains non-alphanumeric character: %c", char)
				}
			}
		})
	}
}
