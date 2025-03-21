const express = require('express')
const request = require('request');
const dotenv = require('dotenv');

//server settings
global.access_token = '';
dotenv.config();

//The devs api key for spotify 
var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

//get spotify api credentials from enviroment varibles 
var spotify_redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/callback';

console.log("SPOTIFY_CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID);
console.log("SPOTIFY_CLIENT_SECRET:", process.env.SPOTIFY_CLIENT_SECRET);
console.log("SPOTIFY_REDIRECT_URI:", process.env.SPOTIFY_REDIRECT_URI);

//generates a string for the spotify auth
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

//create the express app
var app = express();

//login to spotify, and get access to email, private data, and playlist permissions
app.get('/auth/login', (req, res) => {
  console.log("Received /auth/login request");
  var scope = "streaming user-read-email user-read-private playlist-modify-private playlist-modify-public";  
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  })

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

//extracts the authorization and sends a post to get the access token
app.get('/auth/callback', (req, res) => {
  var code = req.query.code;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.redirect('/')
    }
  });

})

  //give the frontend the access token
app.get('/auth/token', (req, res) => {
  res.json({ access_token: access_token})
})

const path = require('path');
app.use(express.static(path.join(__dirname, '../build')));

// Catch-all handler: for any request that doesn't match an API route, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 5000;

//start the server
app.listen(port, () => {
  console.log(`Server started and listening on port ${port}`);
});
