package logger

import (
	"fmt"
	"log"
	"os"
	"time"
)

const (
	LogsDir = "logs"
)

type LogDir struct {
	Dir string
}

func New() *LogDir {
	err := os.Mkdir(LogsDir, 0666)
	if err != nil {
		return nil
	}
	return &LogDir{
		Dir: LogsDir,
	}
}

func SetLogFile() *os.File {
	year, month, day := time.Now().Date()
	hour, min, sec := time.Now().Clock()
	fileName := fmt.Sprintf("%d-%d-%d-%d-%d-%d.log", day, month, year, hour, min, sec)
	filePath, _ := os.OpenFile(LogsDir+"/"+fileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)

	return filePath
}

func (l *LogDir) Info() *log.Logger {
	return log.New(SetLogFile(), "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func (l *LogDir) Warning() *log.Logger {
	return log.New(SetLogFile(), "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func (l *LogDir) Error() *log.Logger {
	return log.New(SetLogFile(), "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func (l *LogDir) Fatal() *log.Logger {
	return log.New(SetLogFile(), "FATAL: ", log.Ldate|log.Ltime|log.Lshortfile)
}
