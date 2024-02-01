package api

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"io"
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/db"

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

// Function to generate a random nonce
func generateNonce() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, 32)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

// Function to generate OAuth1 signature
func generateSignature(method, url string, params map[string]string) string {
	// Sort parameters
	var sortedParams []string
	for key, value := range params {
		sortedParams = append(sortedParams, key+"="+value)
	}
	sortedParamsStr := strings.Join(sortedParams, "&")

	// Construct base string
	baseString := method + "&" + url + "&" + url.QueryEscape(sortedParamsStr) // Note: URL encode sortedParamsStr

	// Create signing key
	signingKey := consumerSecret + "&"

	// Calculate HMAC SHA1 signature
	hash := hmac.New(sha1.New, []byte(signingKey))
	hash.Write([]byte(baseString))
	signature := hash.Sum(nil)

	// Base64 encode the signature
	return base64.StdEncoding.EncodeToString(signature)
}

func GetGarminToken(c *gin.Context) {
	consumerKey := config.GetDotEnvStr("GARMIN_CONSUMER_KEY")
	consumerSecret := config.GetDotEnvStr("GARMIN_CONSUMER_SECRET")
	// callbackURL := config.GetDotEnvStr("GARMIN_CALLBACK_URL")

	requestTokenUrl := "https://connectapi.garmin.com/oauth-service/oauth/request_token"

	// Generate OAuth1 parameters
	oauthParams := map[string]string{
		"oauth_consumer_key":     consumerKey,
		"oauth_consumer_secret":  consumerSecret,
		"oauth_signature_method": "HMAC-SHA1",
		"oauth_timestamp":        fmt.Sprintf("%d", time.Now().Unix()),
		"oauth_nonce":            generateNonce(),
		"oauth_version":          "1.0",
	}

	// Generate OAuth1 signature
	signature := generateSignature("POST", requestTokenUrl, oauthParams, consumerSecret)

	// Add signature to OAuth1 parameters
	oauthParams["oauth_signature"] = signature

	// Construct Authorization header
	authHeader := "OAuth "
	for key, value := range oauthParams {
		authHeader += fmt.Sprintf(`%s="%s", `, key, value)
	}
	authHeader = strings.TrimSuffix(authHeader, ", ")

	// Make HTTP request
	req, err := http.NewRequest("GET", requestTokenUrl, nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}
	req.Header.Set("Authorization", authHeader)

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
		return
	}
	defer resp.Body.Close()

	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	// Print response
	fmt.Println("Response:", string(body))

	// // Create OAuth1 configuration
	// config := oauth1.Config{
	// 	ConsumerKey:    consumerKey,
	// 	ConsumerSecret: consumerSecret,
	// 	CallbackURL:    callbackURL,
	// 	Endpoint: oauth1.Endpoint{
	// 		RequestTokenURL: "https://connectapi.garmin.com/oauth-service/oauth/request_token",
	// 	},
	// }

	// // Obtain request token
	// requestToken, requestSecret, err := config.RequestToken()
	// if err != nil {
	// 	fmt.Println("Error obtaining request token:", err)
	// 	return
	// }
	// // get token secret
	// fmt.Println(requestToken, requestSecret)
	// // Construct OAuth1 authorization header
	// authorizationURL, err := config.AuthorizationURL(requestToken)
	// if err != nil {
	// 	// Handle error
	// 	fmt.Println("Error constructing authorization URL:", err)
	// 	c.JSON(http.StatusInternalServerError, gin.H{
	// 		"message": err.Error(),
	// 	})
	// 	return
	// }

	// Redirect the user to this URL in their browser
	// URL := fmt.Sprintf("https://connect.garmin.com/oauthConfirm%s%s", authorizationURL, fmt.Sprintf("&oauth_callback=%s", callbackURL))
	// fmt.Println(URL)
	// c.JSON(http.StatusOK, gin.H{
	// 	"url": URL,
	// })
}

func generateSignatureBaseString(method, baseURL string, parameters map[string]string) string {
	// Sort parameters alphabetically by parameter name
	var keys []string
	for key := range parameters {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	// Construct parameter string
	var parameterStrings []string
	for _, key := range keys {
		parameterStrings = append(parameterStrings, key+"="+url.QueryEscape(parameters[key]))
	}
	parameterString := strings.Join(parameterStrings, "&")

	// Concatenate HTTP method, base URL, and parameter string into a single string
	return fmt.Sprintf("%s&%s&%s", method, url.QueryEscape(baseURL), url.QueryEscape(parameterString))
}

func generateOAuthSignature(signatureBaseString, consumerKey string) string {
	key := []byte(consumerKey)
	h := hmac.New(sha1.New, key)
	h.Write([]byte(signatureBaseString))
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
	return signature
}

func GetGarminUserAccessToken(c *gin.Context) {
	// Sample parameters
	// consumerKey := config.GetDotEnvStr("GARMIN_CONSUMER_KEY")
	// consumerSecret := config.GetDotEnvStr("GARMIN_CONSUMER_SECRET")

	parameters := map[string]string{
		"oauth_consumer_key": "4a1b1a5d-356d-4f41-9a50-65461fe7f746",
		// "oauth_consumer_secret":  "sHSJsTPQoP2sm19NNCNUnPVkMQkqRHr9Eg7",
		"oauth_token":            "47cca896-0075-4d3b-b133-280dc7d5f8ae",
		"oauth_signature_method": "HMAC-SHA1",
		"oauth_nonce":            "2lRbgVyTAgh",
		"oauth_timestamp":        strconv.FormatInt(time.Now().Unix(), 10), // Current timestamp in seconds
		"oauth_version":          "1.0",
		"oauth_verifier":         "2fW4K1aUqU",
	}

	// HTTP method
	httpMethod := "POST"

	// Base URL
	baseURL := "https://connectapi.garmin.com/oauth-service/oauth/access_token"

	// Generate signature base string
	signatureBaseString := generateSignatureBaseString(httpMethod, baseURL, parameters)

	// fmt.Println("Signature Base String:", signatureBaseString)

	signature := generateOAuthSignature(signatureBaseString, "4a1b1a5d-356d-4f41-9a50-65461fe7f746")
	// fmt.Println("Signature:", signature)

	// Perform API call to Garmin
	req, err := http.NewRequest(httpMethod, baseURL, nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}

	// Add OAuth parameters to the request header
	authorizationHeader := url.QueryEscape("oauth_consumer_key") + "=\"" + url.QueryEscape(parameters["oauth_consumer_key"]) + "\", " +
		// url.QueryEscape("oauth_consumer_secret") + "=\"" + url.QueryEscape(parameters["oauth_consumer_secret"]) + "\"" +
		url.QueryEscape("oauth_signature") + "=\"" + url.QueryEscape(signature) + "\"" +
		url.QueryEscape("oauth_signature_method") + "=\"" + url.QueryEscape(parameters["oauth_signature_method"]) + "\", " +
		url.QueryEscape("oauth_token") + "=\"" + url.QueryEscape(parameters["oauth_token"]) + "\", " +
		url.QueryEscape("oauth_nonce") + "=\"" + url.QueryEscape(parameters["oauth_nonce"]) + "\", " +
		url.QueryEscape("oauth_timestamp") + "=\"" + url.QueryEscape(parameters["oauth_timestamp"]) + "\", " +
		url.QueryEscape("oauth_version") + "=\"" + url.QueryEscape(parameters["oauth_version"]) + "\", " +
		url.QueryEscape("oauth_verifier") + "=\"" + url.QueryEscape(parameters["oauth_verifier"]) + "\""
	req.Header.Set("Authorization", authorizationHeader)

	client := http.Client{}
	fmt.Println(req.Header)
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	// Print the HTML body
	fmt.Println(string(body))

	// Process response
	fmt.Println(resp)
	fmt.Println("Response Status:", resp.Status)
	//get html body
	c.String(http.StatusOK, string(body))

}
