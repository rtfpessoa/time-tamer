package logger

import (
	"go.uber.org/zap"
)

var zapLog *zap.Logger

func init() {
	var err error
	config := zap.NewProductionConfig()

	zapLog, err = config.Build(zap.AddCallerSkip(1))
	if err != nil {
		panic(err)
	}
}

func Debug(message string, fields ...zap.Field) {
	zapLog.Debug(message, fields...)
}

func Debugf(template string, args ...interface{}) {
	zapLog.Sugar().Debugf(template, args...)
}

func Info(message string, fields ...zap.Field) {
	zapLog.Info(message, fields...)
}

func Infof(template string, args ...interface{}) {
	zapLog.Sugar().Infof(template, args...)
}

func Warn(message string, fields ...zap.Field) {
	zapLog.Warn(message, fields...)
}

func Warnf(template string, args ...interface{}) {
	zapLog.Sugar().Warnf(template, args...)
}

func Error(message string, fields ...zap.Field) {
	zapLog.Error(message, fields...)
}

func Errorf(template string, args ...interface{}) {
	zapLog.Sugar().Errorf(template, args...)
}

func Fatal(message string, fields ...zap.Field) {
	zapLog.Fatal(message, fields...)
}

func Fatalf(template string, args ...interface{}) {
	zapLog.Sugar().Fatalf(template, args...)
}
