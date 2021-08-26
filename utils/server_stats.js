const Discord = require('discord.js')
const Statuspage = require('../statuspage.io/dist').Statuspage
const lodash = require('lodash')
const moment = require('moment')

const testPrefix = process.env.TEST_MODE ? 'test_' : ''

const convertTime = (time) => moment(time).format('YYYY-MM-DD HH:mm:ss')

let lastUpdate = new Date().getTime()

const createBasicEmbed = () => {
	const embed = new Discord.MessageEmbed()
	embed.setColor('RANDOM')
	embed.setAuthor('Paladins Server Status', 'https://paladinsassets.com/miscellaneous/crystals.png')
	embed.setURL('http://status.hirezstudios.com/')
	embed.setFooter(`Current time ${convertTime()}`)
	return embed
}

const addServerStats = (embed, updates) => {
	for (const update of updates) {
		embed.addField(`${update.name.replace('Paladins', '')}`, `
            ${update.description !== undefined ? update.description : ''}
            **Status:** ${lodash.upperFirst(update.status)}
            **Updated At:** ${convertTime(update.updated_at)}
        `, true)
	}
}

const init = function (discord, database) {
	listener(discord, database)
	const maintenance = async function (snapshot) {
		lastUpdate = new Date().getTime()
		const updates = snapshot.val()
		const channelList = (await database.ref(`${testPrefix}announce_channels`).once('value')).val()
		const bodyText = updates.incident_updates[0].body
		for (const key in channelList) {
			const channel = await discord.channels.fetch(key)
			const embed = createBasicEmbed()
			embed.setTitle(updates.name)
			embed.setDescription(`
                **Status:** ${lodash.upperFirst(updates.status)}
                ${bodyText}
                **Updated At:** ${convertTime(updates.updated_at)}
                **Scheduled for:** ${convertTime(updates.scheduled_for)}
                **Scheduled until:** ${convertTime(updates.scheduled_until)}\n
            `)
			addServerStats(embed, updates.components)
			await channel.send(embed)
		}
	}
	database.ref(`${testPrefix}server_status/scheduled_maintenances`).on('child_added', maintenance)
	database.ref(`${testPrefix}server_status/scheduled_maintenances`).on('child_changed', maintenance)
	database.ref(`${testPrefix}server_status/incidents`).on('child_added', maintenance)
	database.ref(`${testPrefix}server_status/incidents`).on('child_changed', maintenance)
	database.ref(`${testPrefix}server_status_components`).on('child_changed', async function (snapshot) {
		setTimeout(async () => {
			const currentTime = new Date().getTime()
			if ((currentTime - lastUpdate) < 10000) {
				return
			}
			const updates = snapshot.val()
			const channelList = (await database.ref(`${testPrefix}announce_channels`).once('value')).val()
			for (const key in channelList) {
				const channel = await discord.channels.fetch(key)
				const embed = createBasicEmbed()
				addServerStats(embed, updates)
				await channel.send(embed)
			}
		}, 5000)
	})
}

const listener = async function (discord, database) {
	try {
		const statuspage = new Statuspage(process.env.STATUSPAGE_ID || 'stk4xr7r1y0r')
		statuspage.api.getSummary().then(response => {
			const filteredResponse = {}
			const components = response.components.filter(x => x.name.toLowerCase().includes('paladins')).filter(x => !x.group)
			filteredResponse.scheduled_maintenances = response.scheduled_maintenances.filter(x => x.name.toLowerCase().includes('paladins'))
			filteredResponse.incidents = response.incidents.filter(x => x.name.toLowerCase().includes('paladins'))
			database.ref(`${testPrefix}server_status_components/status`).set(components)
			database.ref(`${testPrefix}server_status`).set(filteredResponse)
		})
	} catch (error) {
		console.log(error)
	}
	setTimeout(() => {
		listener(discord, database)
	}, 1000 * 30)
}

module.exports = { init }
