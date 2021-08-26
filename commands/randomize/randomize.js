const { Command } = require('discord.js-commando')
const paladinsData = require('../../paladins_data.json')
const { selectOption } = require('../../utils/basic')
const { getDatabase, ref, get, set } = require('firebase/database')
const { MessageMenuOption, MessageMenu } = require('discord-buttons')

module.exports = class RandomizeCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'randomize',
			aliases: ['rando'],
			group: 'randomize',
			memberName: 'randomize',
			description: 'Randomize the map(Siege) and champions of custom matches'
		})
	}

	async run (message) {
		if (message.channel.type === 'dm') return

		const database = getDatabase()

		const selectedVoiceChannel = message.member.voice.channel

		if (!selectedVoiceChannel) {
			message.reply('Sorry i couldn\'t find your voice channel')
			return
		}

		let players = Array.from(selectedVoiceChannel.members.values()).map((x) => x.user).filter((x) => x.bot === false)

		if (message.mentions.members.size > 0) {
			players = players.filter(x => !Array.from(message.mentions.members.keys()).includes(x.id))
		}

		if (players.length < 1) {
			message.reply('Sorry there is not enough players to play')
			return
		}

		if (players.length % 2 !== 0) {
			players.push({ username: 'bot', bot: true })
		}

		const defaultOption = new MessageMenuOption()
			.setLabel('Default Setting')
			.setEmoji('👥')
			.setValue('randomize')
			.setDescription('Randomize the map(Siege) and champions for custom matches')

		const defaultMapOption = new MessageMenuOption()
			.setLabel('Default Setting With Map Selection')
			.setEmoji('👥')
			.setValue('randomize-map')
			.setDescription('Randomize the map(Map type Selector) and champions for custom matches')

		const defaultClassOption = new MessageMenuOption()
			.setLabel('Default Setting With Class Selection')
			.setEmoji('👥')
			.setValue('randomize-champ')
			.setDescription('Randomize the map(Siege) and champions(Class Selector) for custom matches')

		const defaultClassMapOption = new MessageMenuOption()
			.setLabel('Siege With Class Selection And Map Selection')
			.setEmoji('👥')
			.setValue('randomize-champ-map')
			.setDescription('Randomize the map(Map type Selector) and champions(Class Selector) for custom matches')

		const defaultCompOption = new MessageMenuOption()
			.setLabel('Siege With Team Comp Selection')
			.setEmoji('👥')
			.setValue('randomize-comp')
			.setDescription('Randomize the team and team comp for custom matches')

		const defaultCompMapOption = new MessageMenuOption()
			.setLabel('Team Comp Selection And Map Selection Both')
			.setEmoji('👥')
			.setValue('randomize-comp-map')
			.setDescription('Randomize the map(Map type Selector) and team comp for custom matches')

		const teamOption = new MessageMenuOption()
			.setLabel('Single Team')
			.setEmoji('👤')
			.setValue('randomize-team')
			.setDescription('Randomize champions of the same team')

		const teamCompOption = new MessageMenuOption()
			.setLabel('Single Team with Team Comp Selection')
			.setEmoji('👤')
			.setValue('randomize-team-comp')
			.setDescription('Randomize the team with team comp for custom matches')

		const teamClassOption = new MessageMenuOption()
			.setLabel('Single Team with Class Selection')
			.setEmoji('👤')
			.setValue('randomize-team-champ')
			.setDescription('Randomize the team champions(Class Selector) for custom matches')

		const select = new MessageMenu()
			.setID('customid')
			.setPlaceholder('Randomize Options')
			.setMaxValues(1)
			.setMinValues(1)
			.addOption(defaultOption)
			.addOption(defaultMapOption)
			.addOption(defaultClassOption)
			.addOption(defaultClassMapOption)
			.addOption(defaultCompOption)
			.addOption(defaultCompMapOption)
			.addOption(teamOption)
			.addOption(teamClassOption)
			.addOption(teamCompOption)

		message.channel.send('Select the option that you like to play ?', select)
	}
}
