const { Command } = require('discord.js-commando')
const paladinsData = require('../../paladins_data.json')
const { getDatabase, ref, get } = require('firebase/database')
const { MessageMenuOption, MessageMenu, MessageButton } = require('discord-buttons')
const Table = require('easy-table')
const lodash = require('lodash')
const { selectOption, selectOptionSingle } = require('../../utils/basic')

module.exports = class RandomizeCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'randomize',
			aliases: ['rando'],
			group: 'randomize',
			memberName: 'randomize',
			guildOnly: true,
			description: 'Helps to randomize paladins game experience'
		})
	}

	randomizeSelection (message) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
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
				.setID('randomize')
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

			const msg = await message.channel.send('Select the option that you like to play ?', {
				components: [
					{
						type: 1,
						components: [select]
					},
					{
						type: 1,
						components: [new MessageButton().setStyle('red').setID('cancel').setLabel('Cancel')]
					}
				]
			})

			const collect = msg.createMenuCollector((button) => button.clicker.user.id === message.author.id, { time: process.env.DISCORD_AWAIT_TIME || 60e3 })
			const buttonCollector = msg.createButtonCollector((button) => button.clicker.user.id === message.author.id, { time: process.env.DISCORD_AWAIT_TIME || 60e3 })

			collect.on('collect', async (button) => {
				await button.reply.defer()
				collect.stop()
				buttonCollector.stop()
				resolve(button.values[0])
			})

			buttonCollector.on('collect', async (button) => {
				await button.reply.defer()
				collect.stop()
				buttonCollector.stop()
				resolve()
			})

			collect.on('end', async (_, reason) => {
				await msg.delete()
				if (reason === 'time') resolve('time')
			})
		})
	}

	async run (message) {
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

		const mainCommand = await this.randomizeSelection(message)

		if (!mainCommand || mainCommand === 'time') {
			if (mainCommand === 'time') message.reply('Sorry i couldn\'t find the option you selected')
			return
		}

		if (mainCommand.indexOf('team') < 0) {
			if (players.length % 2 !== 0) {
				players.push({ username: 'bot', bot: true })
			}

			let map = null
			if (mainCommand.indexOf('map') < 0) {
				map = lodash.shuffle(paladinsData.maps.filter((x) => x.type === 'Siege')).pop()
			} else {
				const mapTypes = lodash.uniqBy(paladinsData.maps, 'type').map((x) => x.type)

				const typeList = await selectOption(
					message,
					'Please select map type that you like to play',
					mapTypes
				)

				if (!typeList || typeList === 'time') {
					if (typeList === 'time') message.reply('You have to pick a map type to continue')
					return
				}

				map = lodash.shuffle(
					paladinsData.maps.filter((x) => typeList.includes(x.type))
				).pop()
			}

			const playerCount = players.length

			const shuffledPlayers = lodash.chunk(lodash.shuffle(players), playerCount / 2)

			let filterClass = paladinsData.classes

			if (mainCommand.indexOf('champ') > -1) {
				filterClass = await selectOption(
					message,
					'Please select class that you guys like to play',
					paladinsData.classes
				)

				if (!filterClass || filterClass === 'time') {
					if (filterClass === 'time') message.reply('You have to pick a class to continue')
					return
				}
			}

			let comp = paladinsData.comps[0]

			let compName = 'Default Comp'

			if (mainCommand.indexOf('comp') > -1) {
				compName = await selectOptionSingle(
					message,
					'Please select a comp that you guys like to play',
					paladinsData.comps.map((x) => x.name)
				)

				if (!compName || compName === 'time') {
					if (compName === 'time') message.reply('You have to pick a comp to continue')
					return
				}

				comp = paladinsData.comps.find((x) => x.name === compName)

				if (playerCount / 2 > comp.classes.length) {
					message.reply(`You must have a maximum of ${comp.classes.length} people on each team`)
					return
				}
			}

			let description = `${map.name} (${playerCount / 2} vs ${playerCount / 2})  (${compName})\n\n`

			for (const index in shuffledPlayers) {
				const t = new Table()

				description += `Team ${index - -1}` + '\n'

				let champs = lodash.shuffle(
					paladinsData.champions.filter((x) => filterClass.includes(x.class))
				)

				let champsFull = lodash.shuffle(paladinsData.champions)

				for (const playerIndex in shuffledPlayers[index]) {
					if (mainCommand.indexOf('comp') > -1) {
						filterClass = [comp.classes[playerIndex]]
						champs = lodash.shuffle(
							champsFull.filter((x) => x.class === comp.classes[playerIndex])
						)
					}

					const element = shuffledPlayers[index][playerIndex]
					if (element.bot === false) {
						t.cell('Player', element.username)

						if (mainCommand.indexOf('champ') < 0 && mainCommand.indexOf('comp') < 0) {
							let userClasses = (await get(ref(database, `assigned_users/${element.id}`))).val()

							let filteredChampions = champsFull

							if (userClasses != null) {
								filteredChampions = champsFull.filter((x) => userClasses.includes(x.class))
							} else {
								userClasses = paladinsData.classes
							}

							t.cell('Classes', userClasses.map((x) => x.split(' ').map((y) => y.substring(0, 1)).join(' ')).join(', '))

							const tempChampList = lodash.shuffle(filteredChampions)
							const shuffledChampions = tempChampList.pop()

							champsFull = champsFull.filter((x) => x.champion !== shuffledChampions.champion)

							t.cell('Champion', shuffledChampions.champion)
						} else {
							t.cell('Classes', filterClass.map((x) => x.split(' ').map((y) => y.substring(0, 1)).join(' ')).join(', '))

							const shuffledChampions = champs.pop()

							champsFull = champsFull.filter((x) => x.champion !== shuffledChampions.champion)

							t.cell('Champion', shuffledChampions.champion)
						}

						t.newRow()
					} else {
						t.cell('Player', 'Bot')
						t.cell('Classes', filterClass.map((x) => x.split(' ').map((y) => y.substring(0, 1)).join(' ')).join(', '))
						t.cell('Champion', 'Randomly pick by game')
						t.newRow()
					}
				}
				description += t.toString() + '\n'
			}

			message.channel.send('```' + description + '```')
		} else {
			players = lodash.shuffle(players)

			let filterClass = paladinsData.champions

			if (mainCommand.indexOf('champ') > -1) {
				filterClass = await selectOption(
					message,
					'Please select class that you guys like to play',
					paladinsData.classes
				)

				if (!filterClass || filterClass === 'time') {
					if (filterClass === 'time') message.reply('You have to pick a class to continue')
					return
				}
			}

			let comp = paladinsData.comps[0]

			let compName = 'Default Comp'

			if (mainCommand.indexOf('comp') > -1) {
				compName = await selectOptionSingle(
					message,
					'Please select a comp that you guys like to play',
					paladinsData.comps.map((x) => x.name),
					1
				)

				if (!compName || compName === 'time') {
					if (compName === 'time') message.reply('You have to pick a comp to continue')
					return
				}

				comp = paladinsData.comps.find((x) => x.name === compName)

				if (players.length > comp.classes.length) {
					message.reply(`You must have a maximum of ${comp.classes.length} people on team`)
					return
				}
			}

			const t = new Table()

			let champs = lodash.shuffle(
				paladinsData.champions.filter((x) => filterClass.includes(x.class))
			)

			let champsFull = lodash.shuffle(paladinsData.champions)

			for (const playerIndex in players) {
				const element = players[playerIndex]

				t.cell('Player', element.username)

				if (mainCommand.indexOf('comp') > -1) {
					filterClass = [comp.classes[playerIndex]]
					champs = lodash.shuffle(champsFull.filter((x) => x.class === comp.classes[playerIndex]))
				}

				if (mainCommand.indexOf('champ') < 0 && mainCommand.indexOf('comp') < 0) {
					let userClasses = (await get(ref(database, `assigned_users/${element.id}`))).val()

					let filteredChampions = champsFull

					if (userClasses != null) {
						filteredChampions = champsFull.filter((x) => userClasses.includes(x.class))
					} else {
						userClasses = paladinsData.classes
					}

					t.cell('Classes', userClasses.map((x) => x.split(' ').map((y) => y.substring(0, 1)).join(' ')).join(', '))

					const tempChampList = lodash.shuffle(filteredChampions)
					const shuffledChampions = tempChampList.pop()

					champsFull = champsFull.filter((x) => x.champion !== shuffledChampions.champion)

					t.cell('Champion', shuffledChampions.champion)
				} else {
					t.cell('Classes', filterClass.map((x) => x.split(' ').map((y) => y.substring(0, 1)).join(' ')).join(', '))

					const shuffledChampions = champs.pop()

					champsFull = champsFull.filter((x) => x.champion !== shuffledChampions.champion)

					t.cell('Champion', shuffledChampions.champion)
				}
				t.newRow()
			}

			message.channel.send('```' + `${compName} \n\n ${t.toString()}` + '```')
		}
	}
}
