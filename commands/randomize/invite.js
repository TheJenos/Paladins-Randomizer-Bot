const { Command } = require('discord.js-commando')

module.exports = class InviteCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'invite',
			aliases: ['inv'],
			group: 'randomize',
			memberName: 'invite',
			description: 'Give a invite link for the bot'
		})
	}

	async run (message) {
		const permissions = process.env.DISCORD_PERMISSIONS
		const clientId = process.env.DISCORD_CLIENT_ID
		message.reply(`Here is your invite link : https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot`)
	}
}
