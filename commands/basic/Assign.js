const { Command } = require('discord.js-commando')
const paladinsData = require('../../paladins_data.json')
const { selectOption } = require('../../utils/basic')
const { getDatabase, ref, get, set } = require('firebase/database')

module.exports = class MeowCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'assign',
			aliases: ['my'],
			group: 'basic',
			memberName: 'assign',
			description: 'Assign to classes that you like to play'
		})
	}

	async run (message) {
		if (message.channel.type === 'dm') return

		const database = getDatabase()

		let userData = (await get(ref(database, `assigned_users/${message.author.id}`))).val()

		if (!userData) userData = paladinsData.classes

		const response = await selectOption(message, 'Please select classes that you like to play', paladinsData.classes, userData)

		if (!response) return

		message.channel.send(`<@${message.author.id}>, You have assigned to the **${userData.join('**, **')}**`)
		await set(ref(database, `assigned_users/${message.author.id}`), response)
	}
}
