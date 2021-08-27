require('dotenv').config()
const { CommandoClient, SQLiteProvider } = require('discord.js-commando')
const path = require('path')

const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const { initializeApp } = require('firebase/app')

const ServerStatus = require('./utils/server_stats')
const { getDatabase } = require('firebase/database')

let firebaseConfig = null

if (process.env.FIREBASE) {
	firebaseConfig = {
		apiKey: process.env.FIREBASE_API_KEY,
		authDomain: process.env.FIREBASE_AUTH_DOMAIN,
		projectId: process.env.FIREBASE_ID,
		storageBucket: process.env.FIREBASE_BUCK,
		messagingSenderId: process.env.FIREBASE_MSG_ID,
		appId: process.env.FIREBASE_APP_ID,
		measurementId: process.env.FIREBASE_MES_ID
	}
} else {
	firebaseConfig = require('./firebaseConfig.json')
}

initializeApp(firebaseConfig)

const client = new CommandoClient({
	commandPrefix: process.env.BOT_STARTER,
	owner: '278900227547725824',
	invite: 'https://discord.gg/bnaHK7PdSF'
})

require('discord-buttons')(client)

client.setProvider(
	sqlite.open({ filename: 'database.db', driver: sqlite3.Database }).then(db => new SQLiteProvider(db))
).catch(console.error)

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['randomize', 'Get Random Paladins Things'],
		['server_stats', 'Paladins Server Stats Updates']
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		prefix: false,
		eval: false
	})
	.registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
	client.user.setActivity(`${process.env.BOT_STARTER}help`, { type: 'LISTENING' })

	const database = getDatabase()
	ServerStatus.init(client, database)

	updateSession()
})

function updateSession () {
	const rndChamp = require('lodash').shuffle(require('./paladins_data.json').champions).pop()
	try {
		const filename = rndChamp.champion.toLowerCase().replace(' ', '-').replace("'", '')
		if (!process.env.TEST_MODE) {
			client.user.setAvatar(`https://web2.hirez.com/paladins/champion-icons/${filename}.jpg`)
		}
	} catch (error) {
		console.log(error)
	}
	setTimeout(() => {
		updateSession()
	}, 1000 * 60 * 30)
}

client.on('error', console.error)

client.login(process.env.DISCORD_TOKEN)
