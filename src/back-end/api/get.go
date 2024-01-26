package api

import (
	"fmt"
	"net/http"

	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/db"

	"github.com/dghubble/oauth1"
	"github.com/gin-gonic/gin"
)

func GetTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
	})
}

// GET Req handler functions for the for multiple endpoints.
// It retrieves data from the database and returns a JSON response.
// If an error occurs during the database query, it responds with a 500 Internal Server Error
// and includes the error message in the response JSON.

func GetCategories(c *gin.Context) {
	rows, err := db.GetCategories(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, rows)
}

func GetGeometryTypes(c *gin.Context) {
	rows, err := db.GetGeometryTypes(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, rows)
}

func GetHazards(c *gin.Context) {
	rows, err := db.GetHazards(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, rows)
}

func GetGarminToken(c *gin.Context) {
	consumerKey := config.GetDotEnvStr("GARMIN_CONSUMER_KEY")
	consumerSecret := config.GetDotEnvStr("GARMIN_CONSUMER_SECRET")
	callbackURL := config.GetDotEnvStr("GARMIN_CALLBACK_URL")
	// Create OAuth1 configuration
	config := oauth1.Config{
		ConsumerKey:    consumerKey,
		ConsumerSecret: consumerSecret,
		CallbackURL:    callbackURL,
		Endpoint: oauth1.Endpoint{
			RequestTokenURL: "https://connectapi.garmin.com/oauth-service/oauth/request_token",
		},
	}

	// Obtain request token
	requestToken, _, err := config.RequestToken()
	if err != nil {
		fmt.Println("Error obtaining request token:", err)
		return
	}

	fmt.Println(requestToken)
	// Construct OAuth1 authorization header
	authorizationURL, err := config.AuthorizationURL(requestToken)
	if err != nil {
		// Handle error
		fmt.Println("Error constructing authorization URL:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	// Redirect the user to this URL in their browser
	URL := fmt.Sprintf("https://connect.garmin.com/oauthConfirm%s%s", authorizationURL, fmt.Sprintf("&oauth_callback=%s", callbackURL))
	fmt.Println(URL)
	c.JSON(http.StatusOK, gin.H{
		"token_url": URL,
	})
}
