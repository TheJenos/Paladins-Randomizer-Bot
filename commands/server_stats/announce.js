const { Command } = require('discord.js-commando')
const { getDatabase, ref, set } = require('firebase/database')

module.exports = class AnnounceCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'announce',
			group: 'server_stats',
			memberName: 'announce',
			description: 'Announce'
		})
	}

	async run (message) {
		if (message.channel.type === 'dm') return

		const database = getDatabase()

		const testPrefix = process.env.TEST_MODE ? 'test_' : ''

		const channel = Array.from(message.mentions.channels.values())[0]
		if (!channel) {
			message.reply('You have to mention a text channel to assign')
			return
		}

		set(ref(database, `${testPrefix}announce_channels/${channel.id}`), channel.name)
		message.reply(`Sure, I will announce everything in #${channel.name}`)
	}
}
