# OAuth and Rainbow Web SDK

This is a sample project demonstrating the usage of OAuth 2.0 authentication mechanisms along with Rainbow Web SDK.

The goal of this project is to provide the user with a basic workflow example that will allow the application to connect to Rainbow in a secure way (using authorization code).

## Running the project

Clone the repository, navigate to the folder and run

```bash
npm i
```
Once the libraries are installed in your folder directory, run:
```bash
npm build
```
Update `applicationID` and `applicationSecret` variables in `./server.js` and `applicationID` variable in `./src/index.js`. Then, finally, run:

```bash
npm serve
```

Then open your browser and go to `http://localhost:3001/`

## Setting redirect_uri for your application

You can set **Redirect URI** either via Rainbow HUB or Rainbow CLI. It is extremely important for the functioning of your application as our server will verify it each time a user will try to connect to Rainbow through your application.

To set a `redirect_uri` attribute and assign it to your application, use `rainbow-cli` tool:

```shell
rbw application set-redirecturi YOURAPPID YOURREDIRECTURI
```

For more information on the application lifecycle, you can read the tutorial [Application lifecycle](/#/documentation/doc/hub/application-lifecycle).
