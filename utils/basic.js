const { MessageButton, MessageMenuOption, MessageMenu } = require('discord-buttons')

// eslint-disable-next-line no-async-promise-executor
module.exports.selectOption = async (message, question, options, userData = []) => new Promise(async (resolve, reject) => {
	const components = options.map(x => {
		return {
			type: 1,
			components: [new MessageButton().setStyle('blurple').setEmoji(userData.indexOf(x) > -1 ? '☑️' : '⬜').setID('class_' + x).setLabel(x)]
		}
	})

	const actionButtons = [
		new MessageButton().setStyle('red').setID('cancel').setLabel('Cancel'),
		new MessageButton().setStyle('green').setID('done').setLabel('Confirm')
	]

	components.push({
		type: 1,
		components: actionButtons
	})

	const msg = await message.channel.send(question, { components })

	const collector = msg.createButtonCollector((button) => button.clicker.user.id === message.author.id, { time: process.env.DISCORD_AWAIT_TIME || 60e3 })

	collector.on('collect', async (b) => {
		await b.reply.defer()
		if (b.id.startsWith('class_')) {
			collector.resetTimer({ time: process.env.DISCORD_AWAIT_TIME || 60e3 })
			const buttonClass = b.id.split('_')[1]
			if (userData.indexOf(buttonClass) > -1) {
				userData.splice(userData.indexOf(buttonClass), 1)
			} else {
				userData.push(buttonClass)
			}
		}

		const components = options.map(x => {
			return {
				type: 1,
				components: [new MessageButton().setStyle('blurple').setEmoji(userData.indexOf(x) > -1 ? '☑️' : '⬜').setID('class_' + x).setLabel(x)]
			}
		})

		components.push({
			type: 1,
			components: actionButtons
		})

		await msg.edit(question, { components })

		if (b.id === 'done' || b.id === 'cancel') {
			collector.stop()
			if (b.id === 'done') {
				resolve(userData)
			}
		}
	})

	collector.on('end', async (_, reason) => {
		await msg.delete()
		if (reason === 'time') resolve('time')
	})
})

// eslint-disable-next-line no-async-promise-executor
module.exports.selectOptionSingle = async (message, question, options) => new Promise(async (resolve, reject) => {
	const select = new MessageMenu()
		.setID('randomize')
		.setPlaceholder('Select One')
		.setMaxValues(1)
		.setMinValues(1)
		.addOptions(options.map(x => {
			return new MessageMenuOption()
				.setLabel(x)
				.setValue(x)
		}))

	const msg = await message.channel.send(question, {
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

	const menuCollector = msg.createMenuCollector((button) => button.clicker.user.id === message.author.id, { time: process.env.DISCORD_AWAIT_TIME || 60e3 })
	const collector = msg.createButtonCollector((button) => button.clicker.user.id === message.author.id, { time: process.env.DISCORD_AWAIT_TIME || 60e3 })

	menuCollector.on('collect', async (b) => {
		await b.reply.defer()
		menuCollector.stop()
		collector.stop()
		resolve(b.values[0])
	})

	collector.on('collect', async (b) => {
		await b.reply.defer()
		menuCollector.stop()
		collector.stop()
		resolve()
	})

	collector.on('end', async (_, reason) => {
		await msg.delete()
		if (reason === 'time') resolve('time')
	})
})
