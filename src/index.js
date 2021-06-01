import rainbowSDK from "./rainbow-sdk.min.js";
const applicationID = "";

window.addEventListener("DOMContentLoaded", (event) => {
    let token = null;

    console.log("*** OAUTH with RAINBOW WEB SDK ***");
    window.rainbowSDK = rainbowSDK;

    document.addEventListener(rainbowSDK.callsLog.RAINBOW_ONCALLLOGUPDATED, () => {
        rainbowSDK.callsLog.getAll().then((res) => console.log("EARLY CALLLOG DONE", res[0]));
    });

    /* Try to fetch the token */
    if (!token) {
        console.log("*** Trying to get the token ***");
        let container = document.getElementById("container");
        let loginLink = document.createElement("a");
        loginLink.href = "/login";
        container.appendChild(loginLink);
        fetch("/token")
            .then((res) => {
                console.log(res);
                if (res.ok) {
                    /* Transform Readable Stream into string */
                    return res.text();
                } else {
                    /* If token is not available, allow user to log in */
                    loginLink.innerHTML = "Login to Rainbow";
                    console.log("Couldn't fetch the token, try to log in to Rainbow");
                }
            })
            .then((data) => {
                token = data;
                if (token) {
                    loginLink.innerHTML = "";

                    let refreshButton = document.createElement("button");
                    refreshButton.innerHTML = "REFRESH TOKEN";
                    refreshButton.onclick = window.refreshToken;
                    container.appendChild(refreshButton);

                    let userCard = document.createElement("div");
                    userCard.id = "userData";
                    userCard.innerHTML = "Fetching user data...";
                    container.appendChild(userCard);
                    /* If token is present, start and load the SDK */
                    rainbowSDK.start();
                    rainbowSDK.load({ verboseLog: false });
                }
            })
            .catch((err) => console.log(err));
    }
    window.refreshToken = async () => {
        console.log("REFRESH TOKEN");
        let res = await fetch("/refreshToken");
        if (!res.ok) {
            return res;
        }
        let newToken = await res.text();
        console.log("TOKEN REFRESHED", newToken);
        rainbowSDK.connection.setRenewedToken(newToken);
    };
    let onLoaded = function onLoaded() {
        console.log("*** SDK LOADED ***");

        rainbowSDK
            /* Use only appId to initialize the SDK */
            .initialize(applicationID)
            .then(() => {
                console.log("Rainbow SDK is initialized!");
                /* Once the SDK is initialized, use the token to sign in on Sandbox platform */
                rainbowSDK.connection
                    .signinSandBoxWithToken(token)
                    .then((res) => {
                        console.log("Signed in!", res);
                        createUserCard(res.userData);
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => {
                console.log("Something went wrong with the SDK.", err);
            });
    };

    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
});

function createUserCard(data) {
    let userCard = document.getElementById("userData");
    userCard.innerHTML = "Logged in as: " + data.displayName;
}
