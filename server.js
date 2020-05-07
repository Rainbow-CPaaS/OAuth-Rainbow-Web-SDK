const express = require("express");
const path = require("path");
const querystring = require("querystring");
const session = require("express-session");
const simpleOauth2 = require("simple-oauth2");
const shortid = require("shortid");
const LOG_ID = "[OAUTH_TEST_CLIENT]";
const PORT = 3001;

/* UPDATE THE CREDENTIALS BEFORE RUNNING THE PROGRAM */
const applicationID = "YOUR_APP_ID";
const applicationSecret = "YOUR_APP_SECRET";

/* Choose one of the hosts */
const RAINBOW_HOST = "https://sandbox.openrainbow.com";
// const RAINBOW_HOST = "https://openrainbow.com";

const app = express();

let token = null;
let staticPath = path.join(__dirname, "/src");

app.use(
    session({
        secret: "a secret",
        resave: false,
        saveUninitialized: false
    })
);

app.use(express.static(staticPath));

/* Initialize the OAuth2 Library */
const oauth2 = simpleOauth2.create({
    client: {
        /* Use valid credentials of your application */
        id: applicationID,
        secret: applicationSecret
    },
    auth: {
        tokenHost: RAINBOW_HOST,
        tokenPath: "/api/rainbow/authentication/v1.0/oauth/token",
        authorizePath: "/api/rainbow/authentication/v1.0/oauth/authorize"
    }
});
/* Set the redirect_uri variable to the one that was set by Rainbow CLI */
const redirect_uri = "http://localhost:3001/oauth/callback";

app.get("/login", function (req, res) {
    console.log(`${LOG_ID} Login: initiate login with Rainbow`);
    /* Authorization oauth2 URI */
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri,
        scope: "all", // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
        state: shortid.generate()
    });

    // Redirect to Authorization server authorize endpoint
    res.redirect(authorizationUri);
});

/* Callback service parsing the authorization token and asking for the access token */
app.get("/oauth/callback", function (req, res) {
    /* Handle authentication error if needed */
    if (req.query.error) {
        return res.redirect(
            `/?${querystring.stringify({
                error: "LOGIN_ERROR",
                oauth_error: req.query.error,
                error_description: req.query.error_description
            })}`
        );
    } else {
        /* Use the Oauth2 library to generate the access token */
        const code = req.query.code;
        const tokenOptions = {
            code,
            redirect_uri
        };
        return oauth2.authorizationCode
            .getToken(tokenOptions)
            .then((result) => {
                let fullToken = oauth2.accessToken.create(result);
                token = fullToken.token.access_token;
                console.log(`${LOG_ID} Access Token retrieved: ${token}`);
            })
            .then(() => {
                /* Redirect to the main page */
                return res.redirect("/");
            })
            .catch((err) => {
                console.log(`${LOG_ID} Access Token Error: ${err}`);
            });
    }
});

app.use(function (err, req, res, next) {
    if (err) {
        console.error(`${LOG_ID} Error caught: ${err.stack}`);
        return res.status(500).send(err);
    }
    next();
});

/* Set up an endpoint for your front end where the app will fetch the token */
app.get("/token", (req, res) => {
    if (token) {
        res.send(token);
    } else {
        res.status(500).send(token);
    }
});

app.listen(PORT);
console.info(`${LOG_ID} app started on port ${PORT}`);
