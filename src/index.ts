import { Hono } from "hono";
import { html, raw } from 'hono/html';
import { discordAuth } from '@hono/oauth-providers/discord';
import { Session, sessionMiddleware, CookieStore } from 'hono-sessions';

import { MessageOptions, Pushover } from 'pushover-sdk';

import config from "./config";
import { EmergencySwitch, NotifyBanner, PageLayout, PageLayoutProps } from './page';


type SessionDataTypes = {
	'discord_user': string
	'is_authorised': boolean
	'can_send_emergency': boolean
}

const app = new Hono<{
	Bindings: CloudflareBindings,
	Variables: {
    session: Session<SessionDataTypes>,
    session_key_rotation: boolean
	}
}>();

const store = new CookieStore()

app.use('*', async (c, next) => {
  const middleware = sessionMiddleware({
    store,
    encryptionKey: c.env.COOKIE_ENCRYPTION_KEY,
    expireAfterSeconds: 900,
    autoExtendExpiration: true,
    cookieOptions: {
      sameSite: 'Lax',
      path: '/',
      httpOnly: true,
    },
  })
  return middleware(c, next)
})

app.use('/login', async (c, next) => {
	const clientId = c.env.DISCORD_ID
	const clientSecret = c.env.DISCORD_SECRET

	const discord = discordAuth({
	  client_id: clientId,
	  client_secret: clientSecret,
	  scope: ['identify', 'guilds', 'guilds.members.read'],
	})
  return discord(c, next)
})


app.use('/login', async (c, next) => {
  const session = c.get('session')

	const token = c.get('token')
  const user = c.get('user-discord')
	if (token === undefined || user === undefined) {
		return c.text("Discord login failed", 401)
	}

	try {
		const request = new Request(`https://discord.com/api/v10/users/@me/guilds/${config.ALLOWED_GUILD_ID}/member`, {
			method: 'GET',
			redirect: 'follow',
			headers: {
				Authorization: `Bearer ${token.token}`
			}
		})

		const response = await fetch(request)

		if (response.status === 404) {
			return c.text("User not in required Guild", 401)
		}

		if (!response.ok) {
			return c.text("Unknown error when fetching Guild Member", 500)
		}
	
		const memberData = (await response.json()) as any
		const isInRole = memberData.roles.some((element: string) => config.ALLOWED_GUILD_ROLES.includes(element))

		if (!isInRole) {
			return c.text("User not in required Role", 401)
		}

    
    if (user.username === undefined || user.id === undefined) {
        return c.text("State is in invalid state", 400)
    }

    let username = ""
    
    if (user.username !== undefined) {
        username = `${user.username}`
    }

    if (user.global_name !== undefined) {
    	username = `${user.global_name} (${username})`
    }
     
    session.set("is_authorised", true)
    session.set("discord_user", username)

    if (config.ALLOWED_EMERGENCY_USERS.includes(user.id)) {
    	session.set("can_send_emergency", true)
    }
    
	} catch (error) {
		console.log(error)
		return c.text("Failed to retrieve Guild Member object", 500)
	}

	return c.redirect('/')
})


app.use('/', async (c, next) => {
	const session = c.get('session')

	if (!session.get('is_authorised')) {
		return c.redirect('/login')
	} else {
		session.touch()
		await next()
	}
})


app.post('/', async (c) => {
	const session = c.get('session')
  const body = await c.req.parseBody()

  const pushover = new Pushover({
    token: c.env.PUSHOVER_API_TOKEN,
    user: c.env.PUSHOVER_USER_KEY    
  })

	const pushoverMessage: MessageOptions = {
  	title: `From ${session.get('discord_user')}`,
		message: `${body['message']}`,
		priority: 1,
	}

	const pushoverMessageEmerg: MessageOptions = {
		title: `From ${session.get('discord_user')}`,
		message: `${body['message']}`,
		priority: 2,
		retry: 30,
		expire: 300,
	}
	
	if (!Object.hasOwn(body, "message")) {
		return c.text("Invalid POST body",  400 )
	}

    if (typeof body['message'] !== 'string') {
        return c.text("Invalid POST body", 400 )
    }

  let messageHeader

	if (Object.hasOwn(body, "emerg")) {
		if (!session.get('can_send_emergency')) {
			return c.text("Not authorised for EMERGENCY-level messages", 400 )
		} else {
			await pushover.sendMessage(pushoverMessageEmerg)
			messageHeader = "Message sent to Terry as EMERGENCY message:"
		}
	} else {
		await pushover.sendMessage(pushoverMessage)
		messageHeader = "Message sent to Terry:"
	}

	const props: PageLayoutProps = {
		emerg: html``,
		notify: NotifyBanner(messageHeader, body['message'])
	}

	if (session.get('can_send_emergency')) {
		props.emerg = EmergencySwitch
	}

	return c.html(PageLayout(props));
})

/*
*app.get('/', async (c) => {
*  const response = await c.env.ASSETS.fetch(c.req.raw);
*  return response;
*})
*/

app.get('/', (c) => {
	const session = c.get('session')

	const props: PageLayoutProps = {
			emerg: html``,
			notify: html``
	}

	if (session.get('can_send_emergency')) {
		props.emerg = EmergencySwitch
	}
	
	return c.html(PageLayout(props))
})

export default app;
