package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	limiter "github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

func keyGetter(ctx *gin.Context) string {
	value := ctx.Value(ACCOUNT_ID_KEY)
	if value != nil {
		if accountID, ok := value.(int64); ok {
			return strconv.FormatInt(accountID, 10)
		}
	}

	return ctx.ClientIP()
}

func limitReachedHandler(c *gin.Context) {
	c.String(http.StatusTooManyRequests, "Too many requests. Try again later.")
}

func RateLimiter() gin.HandlerFunc {
	rate := limiter.Rate{
		Period: 1 * time.Hour,
		Limit:  10000,
	}

	store := memory.NewStore()

	instance := limiter.New(store, rate)

	middleware := newMiddleware(instance)

	return middleware
}

func newMiddleware(limiter *limiter.Limiter) gin.HandlerFunc {
	middleware := &mgin.Middleware{
		Limiter:        limiter,
		OnError:        mgin.DefaultErrorHandler,
		OnLimitReached: limitReachedHandler,
		KeyGetter:      keyGetter,
		ExcludedKey:    nil,
	}

	return func(ctx *gin.Context) {
		middleware.Handle(ctx)
	}
}
