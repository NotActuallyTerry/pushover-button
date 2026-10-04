# Pushover message sender

This is an alright-looking page for sending a message via Pushover to a person.
It has Discord authentication, and you can restrict the users that can send a message to members of certain roles in a guild.
Messages will send as high priority. Additionally, you can allow certain users to send EMERGENCY-level messages to you.

## Deploying
You need a Cloudflare account to deploy this, and a Discord application.
The following need to be deployed as secrets alongside the worker:
 - `COOKIE_ENCRYPTION_KEY`: A random string, at least 32 characters long
 - `DISCORD_ID`: The Discord application ID
 - `DISCORD_SECRET`: The Discord application secret
 - `PUSHOVER_API_TOKEN`: A Pushover API token
 - `PUSHOVER_USER_KEY`: Your Pushover user key

Other settings are configured in `src/config.ts`:
 - `ALLOWED_GUILD_ID`: A guild ID. Users must be a member of this guild to send messages
 - `ALLOWED_GUILD_ROLES`: A list of role IDs. Users must also be in at least one of these roles
 - `ALLOWED_EMERGENCY_USERS`: A list of User IDs that can send EMERGENCY messages