package api

import (
	"cycling-route-planner/src/back-end/config"
	"encoding/base64"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func PostTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "Good",
	})
}

// type Attachments []string
type EmailMessage struct {
	To          string        `json:"to"`
	From        string        `json:"from"`
	Subject     string        `json:"subject"`
	Text        string        `json:"text"`
	Attachments [2]Attachment `json:"attachments`
}

type Attachment struct {
	Content     string `json:"content"`
	Filename    string `json:"filename"`
	Type        string `json:"type"`
	Disposition string `json:"disposition"`
}

func PostSendEmail(c *gin.Context) {
	API_KEY := config.GetDotEnvStr("SENDGRID_API_KEY")
	fmt.Println(API_KEY)

	var message EmailMessage
	if c.BindJSON(&message) == nil {

		client := sendgrid.NewSendClient(API_KEY)
		sendgridMessage := mail.NewV3Mail()

		from := mail.NewEmail("FloodX", "floodxalerts@gmail.com")
		to := mail.NewEmail(message.To, message.To)
		text := mail.NewContent("text/plain", message.Text)

		sendgridMessage.SetFrom(from)
		sendgridMessage.AddContent(text)

		for _, s := range message.Attachments {
			attachment := mail.NewAttachment()
			fileContent := base64.StdEncoding.EncodeToString([]byte(s.Content))
			attachment.SetContent(fileContent)
			attachment.SetFilename(s.Filename)
			attachment.SetType(s.Type)
			attachment.SetDisposition(s.Disposition)
			sendgridMessage.AddAttachment(attachment)
		}

		personalization := mail.NewPersonalization()
		personalization.AddTos(to)
		personalization.Subject = message.Subject

		sendgridMessage.AddPersonalizations(personalization)
		sendgridMessage.Headers = map[string]string{
			"Access-Control-Allow-Origin": "*",
		}

		if res, err := client.Send(sendgridMessage); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "Bad",
				"message": "Email not sent",
				"data":    err,
			})
		} else {
			fmt.Println(res)
			c.JSON(http.StatusOK, gin.H{
				"status":  "Good",
				"message": "Email sent",
				"data":    message,
			})
		}
	}

}
