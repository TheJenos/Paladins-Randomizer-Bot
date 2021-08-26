const { Command } = require('discord.js-commando')
const { getDatabase, ref, remove } = require('firebase/database')

module.exports = class UnannounceCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'unannounce',
			group: 'server_stats',
			memberName: 'unannounce',
			description: 'Stop Announcing paladins server status'
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

		remove(ref(database, `${testPrefix}announce_channels/${channel.id}`))
		message.reply(`Sure, I will announce everything in #${channel.name}`)
	}
}
