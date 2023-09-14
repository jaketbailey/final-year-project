package auth

import (
	"cycling-route-planner/src/back-end/config"
	"cycling-route-planner/src/back-end/utils/logger"
	"html/template"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/strava"
)

var Logger = logger.New()

var authTemplate = `
<p><a href="/logout/{{.Provider}}">logout</a></p>
<p>Name: {{.Name}} [{{.LastName}}, {{.FirstName}}]</p>
<p>Email: {{.Email}}</p>
<p>NickName: {{.NickName}}</p>
<p>Location: {{.Location}}</p>
<p>AvatarURL: {{.AvatarURL}} <img src="{{.AvatarURL}}"></p>
<p>Description: {{.Description}}</p>
<p>UserID: {{.UserID}}</p>
<p>AccessToken: {{.AccessToken}}</p>
<p>ExpiresAt: {{.ExpiresAt}}</p>
<p>RefreshToken: {{.RefreshToken}}</p>
`

type ProviderIndex struct {
	Providers    []string
	ProvidersMap map[string]string
}

var providerIndex ProviderIndex

func LoadProviders() {
	var StravaProvider strava.Provider
	StravaProvider.ClientKey = config.GetDotEnvStr("STRAVA_CLIENT_ID")
	StravaProvider.Secret = config.GetDotEnvStr("STRAVA_CLIENT_SECRET")
	StravaProvider.CallbackURL = "http://localhost:8080/api/strava/callback"
	StravaProvider.HTTPClient = http.DefaultClient

	goth.UseProviders(
		strava.New(
			StravaProvider.ClientKey,
			StravaProvider.Secret,
			StravaProvider.CallbackURL,
			"activity:write",
		),
	)

	m := map[string]string{
		"strava": "Strava",
	}

	var keys []string
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	providerIndex.Providers = keys
	providerIndex.ProvidersMap = m

}

func GetAuthCallback(c *gin.Context) {
	_, err := gothic.CompleteUserAuth(c.Writer, c.Request)
	if err != nil {
		Logger.Error().Println(err)
		return
	}

	// t, _ := template.New("foo").Parse(authTemplate)
	// t.Execute(c.Writer, user)
	c.HTML(http.StatusOK, "auth.tmpl.html", gin.H{
		"content": "Auth",
	})
}

func GetLogout(c *gin.Context) {
	gothic.Logout(c.Writer, c.Request)
	c.Writer.Header().Set("Location", "/")
	c.Writer.WriteHeader(http.StatusTemporaryRedirect)
	c.HTML(http.StatusOK, "auth", nil)
}

func GetAuth(c *gin.Context) {
	if gothUser, err := gothic.CompleteUserAuth(c.Writer, c.Request); err == nil {
		t, _ := template.New("foo").Parse(authTemplate)
		t.Execute(c.Writer, gothUser)
	} else {
		gothic.BeginAuthHandler(c.Writer, c.Request)
	}
	c.HTML(http.StatusOK, "auth.tmpl.html", gin.H{
		"content": "Auth",
	})
}

// var indexTemplate = `{{range $key,$value:=.Providers}}
//     <p><a href="/auth/{{$value}}">Log in with {{index $.ProvidersMap $value}}</a></p>
// {{end}}`

func BeginAuthentication(c *gin.Context) {
	// t, _ := template.New("foo").Parse(indexTemplate)
	// t.Execute(c.Writer, providerIndex)
	c.HTML(http.StatusOK, "index.tmpl.html", gin.H{
		"content": "Authenticate",
	})
}
