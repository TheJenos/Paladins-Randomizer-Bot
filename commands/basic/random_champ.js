const { Command } = require('discord.js-commando')
const paladinsData = require('../../paladins_data.json')
const { selectOption } = require('../../utils/basic')
const lodash = require('lodash')

module.exports = class AssignCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'random_champ',
			aliases: ['rndchamp'],
			group: 'basic',
			memberName: 'random_champ',
			description: 'Give a random Champion'
		})
	}

	async run (message) {
		const response = await selectOption(message, 'Please select classes that you like to play', paladinsData.classes)

		if (!response) return

		if (response.length === 0) {
			message.reply('You have to pick a class to continue')
			return
		}

		const filteredChampion = lodash.shuffle(
			paladinsData.champions.filter((x) => response.includes(x.class))
		).pop()

		message.channel.send(`<@${message.author.id}>, You have to play **${filteredChampion.champion}** as in your next game`)
	}
}
