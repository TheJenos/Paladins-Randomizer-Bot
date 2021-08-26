const { Command } = require('discord.js-commando')
const paladinsData = require('../../paladins_data.json')
const { selectOption } = require('../../utils/basic')
const lodash = require('lodash')

module.exports = class AssignCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'random_map',
			aliases: ['rndmap'],
			group: 'basic',
			memberName: 'random_map',
			description: 'Give a random Map'
		})
	}

	async run (message) {
		const mapTypes = lodash.uniqBy(paladinsData.maps, 'type').map((x) => x.type)

		const response = await selectOption(message, 'Please select map type that you like to play', mapTypes)

		if (!response) return

		if (response.length === 0) {
			message.reply('You have to pick a class to continue')
			return
		}

		const filteredMap = lodash.shuffle(
			paladinsData.maps.filter((x) => response.includes(x.type))
		).pop()

		message.channel.send(`<@${message.author.id}>, You guys can try **${filteredMap.name}** for your next game`)
	}
}
