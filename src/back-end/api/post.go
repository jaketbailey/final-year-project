// @title Post
// @package api
// @description POST Request handler functions

package api

import (
	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/utils/logger"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

var Logger = logger.New()

func PostTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "Good",
	})
}

func PostSendEmail(c *gin.Context) {
	// type Attachments []string
	type Attachment struct {
		Content     string `json:"content"`
		Filename    string `json:"filename"`
		Type        string `json:"type"`
		Disposition string `json:"disposition"`
	}

	type EmailMessage struct {
		To          string        `json:"to"`
		From        string        `json:"from"`
		Subject     string        `json:"subject"`
		Text        string        `json:"text"`
		Attachments [2]Attachment `json:"attachments"`
	}

	API_KEY := config.GetDotEnvStr("SENDGRID_API_KEY")
	fmt.Println(API_KEY)

	var message EmailMessage
	if c.BindJSON(&message) == nil {

		client := sendgrid.NewSendClient(API_KEY)
		sendgridMessage := mail.NewV3Mail()

		from := mail.NewEmail(message.From, message.From)
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
				"status": "Good",
				// "message":  "Email sent",
				"data":     message,
				"response": res,
			})
		}
	}
}

type Activity struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	StartDate   string `json:"start_date_local"`
	ElapsedTime int32  `json:"elapsed_time"`
	Route       string `json:"route"`
}

func UploadGPXActivity(activity *Activity) {

	// stravaClient, err := strava.NewAPIClient(ACCESS_TOKEN)
	// if err != nil {
	// 	Logger.Error().Println(err)
	// }

	// stravaClient.Uploads.UploadActivity(postURL, activity.Route, "gpx")

	// var opts = {
	// 	'file': /path/to/file.txt, // {File} The uploaded file.
	// 	'name': name_example, // {String} The desired name of the resulting activity.
	// 	'description': description_example, // {String} The desired description of the resulting activity.
	// 	'trainer': trainer_example, // {String} Whether the resulting activity should be marked as having been performed on a trainer.
	// 	'commute': commute_example, // {String} Whether the resulting activity should be tagged as a commute.
	// 	'dataType': dataType_example, // {String} The format of the uploaded file.
	// 	'externalId': externalId_example // {String} The desired external identifier of the resulting activity.
	// };

	type Body struct {
		File        string `json:"file"`
		Name        string `json:"name"`
		Description string `json:"description"`
		// Trainer bool `json:"trainer"`
		Commute    bool   `json:"commute"`
		DataType   string `json:"data_type"`
		ExternalId string `json:"external_id"`
	}

	tempFile, err := os.CreateTemp("", "gpx_upload.gpx")
	if err != nil {
		Logger.Error().Println(err)
	}
	fmt.Println(tempFile.Name())

	if _, err := tempFile.Write([]byte(activity.Route)); err != nil {
		Logger.Fatal().Println(err)
	}
	if err := tempFile.Close(); err != nil {
		Logger.Fatal().Println(err)
	}

	var body Body
	body.File = tempFile.Name()
	//@todo: use the actual file name
	body.Name = "route"
	body.Description = "description"
	body.Commute = false
	body.DataType = "gpx"
	body.ExternalId = "external_id"

	// CLIENT_SECRET := config.GetDotEnvStr("STRAVA_CLIENT_SECRET")
	ACCESS_TOKEN := config.GetDotEnvStr("STRAVA_ACCESS_TOKEN")
	// REFRESH_TOKEN := config.GetDotEnvStr("STRAVA_REFRESH_TOKEN")
	postURL := "https://www.strava.com/api/v3/uploads"
	params := url.Values{}
	params.Add("access_token", ACCESS_TOKEN)
	params.Add("file", tempFile.Name())
	params.Add("name", activity.Name)
	params.Add("data_type", "gpx")

	resp, err := http.PostForm(postURL, params)

	if err != nil {
		Logger.Error().Println(err)
		return
	}
	defer resp.Body.Close()

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		Logger.Error().Println(err)
	}
	fmt.Println(string(b))

	// do something with responseString

	// http.Post(postURL, "application/json", nil)
	defer os.Remove(tempFile.Name())
}

func PostCreateStravaActivity(c *gin.Context) {
	var activity Activity
	if c.BindJSON(&activity) == nil {
		UploadGPXActivity(&activity)

		c.JSON(http.StatusOK, gin.H{
			"status": "Good",
			"data":   activity,
		})
	}
}
