// @title Post
// @package api
// @description POST Request handler functions

package api

import (
	"bytes"
	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/db"
	"cycling-route-planner/src/back-end/utils/logger"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/dghubble/oauth1"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	strava "github.com/strava/go.strava"
)

var Logger = logger.New()

func PostTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "Good",
	})
}

type EmailMessage struct {
	To          string       `json:"to"`
	From        string       `json:"from"`
	Subject     string       `json:"subject"`
	Text        string       `json:"text"`
	Attachments []Attachment `json:"attachments"`
}

// type Attachments []string
type Attachment struct {
	Content     string `json:"content"`
	Filename    string `json:"filename"`
	Type        string `json:"type"`
	Disposition string `json:"disposition"`
}

// @Function PostSendEmail
// @Summary Handles request to send route attachments via email
// @Description Parses the data sent within the JSON body of the post request and makes a call to the SendGrid API.

func PostSendEmail(c *gin.Context) {
	API_KEY := config.GetDotEnvStr("SENDGRID_API_KEY")

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
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "Bad",
				"message": "Email not sent",
				"data":    err,
			})
		} else {
			c.JSON(http.StatusOK, gin.H{
				"status":   "Good",
				"message":  "Email sent",
				"response": res,
			})
		}
	}
}

func PostCreateHazard(c *gin.Context) {
	res, err := db.CreateHazard(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "Bad",
			"message": "Hazard not created",
			"data":    err,
		})
	}
	c.JSON(http.StatusCreated, gin.H{
		"status": "Good",
		"data":   res,
	})
}

func PostCreateUserHazardReport(c *gin.Context) {

	res, err := db.CreateUserHazardReport(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "Bad",
			"message": "Hazard not created",
			"data":    err,
		})
	}
	c.JSON(http.StatusCreated, gin.H{
		"status": "Good",
		"data":   res,
	})
	return
}

type Activity struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	StartDate   string `json:"start_date_local"`
	ElapsedTime int32  `json:"elapsed_time"`
	Route       string `json:"route"`
	AccessToken string `json:"access_token"`
}

func UploadGPXActivity(activity *Activity) (upload *strava.UploadSummary, err error) {
	stravaClient := strava.NewClient(activity.AccessToken)

	uploadService := strava.NewUploadsService(stravaClient)

	stravaUpload, e := uploadService.Create(strava.FileDataTypes.GPX, "route.gpx", strings.NewReader(activity.Route)).
		ActivityType(strava.ActivityTypes.Ride).
		Name(activity.Name).
		Description("description").
		Do()

	if err != nil {
		Logger.Error().Println(e)
		return
	}
	fmt.Println(stravaUpload)
	return
}

func PostCreateStravaActivity(c *gin.Context) {
	var activity Activity
	if c.BindJSON(&activity) == nil {

		upload, err := UploadGPXActivity(&activity)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "Bad",
				"message": "Activity not created",
				"data":    err,
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":   "Good",
			"data":     activity,
			"response": upload,
		})
	}
}

func randomString() string {
	// define the characters to use
	chars := "abcdefghijklmnopqrstuvwxyz0123456789"

	// generate a random string of length 10
	var result string
	for i := 0; i < 15; i++ {
		result += string(chars[rand.Intn(len(chars))])
	}
	return result
}

func PostUploadRouteImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate a unique filename
	u := uuid.New()

	filename := fmt.Sprintf("src/client/route_image_uploads/%s-%s", u.String(), filepath.Base(file.Filename))
	filepath := fmt.Sprintf("/uploads/%s-%s", u.String(), filepath.Base(file.Filename))

	// Save the file to the server
	if err := c.SaveUploadedFile(file, filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"filename": filepath})
}

func PostCreateGarminCourse(c *gin.Context) {
	// Get the request token and token secret from the query parameters
	token := c.Query("oauth_token")
	tokenSecret := c.Query("oauth_token_secret")

	fmt.Println(token, tokenSecret)

	consumerKey := config.GetDotEnvStr("GARMIN_CONSUMER_KEY")
	consumerSecret := config.GetDotEnvStr("GARMIN_CONSUMER_SECRET")

	// Create OAuth1 configuration
	garminConfig := oauth1.Config{
		ConsumerKey:    consumerKey,
		ConsumerSecret: consumerSecret,
		Endpoint: oauth1.Endpoint{
			AccessTokenURL: "https://connectapi.garmin.com/oauth-service/oauth/access_token",
		},
	}

	httpClient := garminConfig.Client(oauth1.NoContext, oauth1.NewToken(token, tokenSecret))

	// Retrieve JSON payload from request body
	var courseData map[string]interface{}
	if err := c.BindJSON(&courseData); err != nil {
		fmt.Println("Error parsing request body:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	// Convert courseData to JSON bytes
	payload, err := json.Marshal(courseData)
	if err != nil {
		fmt.Println("Error marshaling course payload:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Make POST request to create Garmin course
	url := "https://apis.garmin.com/training-api/courses/v1/course"
	resp, err := httpClient.Post(url, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		fmt.Println("Error making POST request:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	// Check response status
	fmt.Println(resp)
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Unexpected status code:", resp.StatusCode)
		c.JSON(resp.StatusCode, gin.H{"error": "Unexpected status code"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "Good",
		"message": "Garmin course created successfully",
		"data":    courseData,
	})
}
