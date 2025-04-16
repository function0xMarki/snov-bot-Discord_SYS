# SNOV-bot

SNOV-bot is a bot designed to verify Syscoin sentry node holders and allow them access to a specific private channel in a Discord server. It does this by checking if the user has made a collateral transaction and then having them sign a message in the Syscoin QT wallet to prove that they own the collateral address, once this is complete the user is permitted access to the private channel. Each user's collateral will be checked daily and if it is moved then the access to the private channel will be revoked for that user.

## Discord app creation
1. Create an app on the [Discord Developers](https://discord.com/developers/applications) site.
2. Give the app the PRESENCE, SERVER MEMBERS, and MESSAGE CONTENT intents.
3. Set up the username and icon of the app.
4. Get the client secret token, for using with the back-end bot.
5. In the OAuth2 tab, using the OAuth2 URL Generator, give the app the `bot` scope, and the `Manage Channels` bot permission.
6. Use the generated URL to add the app to your Discord server.
7. Edit the private channel to give the bot the following permissions: `View Channel`, `Manage Channel`, and `Manage Permissions`.

## How to run
1. Install [bun](https://bun.sh/).
2. Git clone the repo.
3. Create a .env file in the main project folder and add the relevant info into it.
4. In main project folder run the command: `bun --watch index.js`, this will run the bot and will restart it if it crashes for any reason. Setting up a service to run the bot is advised.