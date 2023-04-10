package logger

import (
	"fmt"
	"io"
	"log"
	"os"
	"time"
)

const (
	LogsDir = "logs"

	Reset  = "\033[0m"
	Red    = "\033[31m"
	Green  = "\033[32m"
	Yellow = "\033[33m"
	Blue   = "\033[34m"
	Purple = "\033[35m"
	Cyan   = "\033[36m"
	Gray   = "\033[37m"
	White  = "\033[97m"
)

var (
	mw = io.MultiWriter(os.Stdout, SetLogFile())
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
	return log.New(mw, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func (l *LogDir) Warning() *log.Logger {
	return log.New(mw, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func (l *LogDir) Error() *log.Logger {
	return log.New(mw, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func (l *LogDir) Fatal() *log.Logger {
	return log.New(mw, "FATAL: ", log.Ldate|log.Ltime|log.Lshortfile)
}
