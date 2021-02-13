const Discord = require("discord.js");
const Statuspage = require('../statuspage.io/dist').Statuspage
const _ = require("lodash");
const moment = require("moment");
const utils = require('../utils/Utils')

const test_prefix = process.env.TEST_MODE ? "test_" : ""

const convertTime = (time) => moment(time).format("YYYY-MM-DD HH:mm:ss")

let last_update = new Date().getTime()

const createBasicEmbed = () => {
    const embed = new Discord.MessageEmbed()
    embed.setColor(utils.getRandomColor())
    embed.setAuthor("Paladins Server Status","https://paladinsassets.com/miscellaneous/crystals.png")
    embed.setURL("http://status.hirezstudios.com/")
    embed.setFooter(`Current time ${convertTime()}`)
    return embed
}

const addServerStats = (embed,updates) => {
    for (const update of updates) {
        embed.addField(`${update.name.replace("Paladins","")}`, `
            ${update.description != undefined?update.description:""}
            **Status:** ${utils.capitalizeFirstLetter(update.status)}
            **Updated At:** ${convertTime(update.updated_at)}
        `,true)
    }
}

const init = function (discord,database) {
    listner(discord,database)
    const maintenance = async function(snapshot) {
        last_update = new Date().getTime()
        const updates = snapshot.val();
        const chennel_list = (await database.ref(`${test_prefix}announce_channels`).once('value')).val()
        const body_text = updates.incident_updates[0].body;
        for (const key in chennel_list) {
            const channel = await discord.channels.fetch(key)
            const embed = createBasicEmbed()
            embed.setTitle(updates.name)
            embed.setDescription(`
                **Status:** ${utils.capitalizeFirstLetter(updates.status)}
                ${body_text}
                **Updated At:** ${convertTime(updates.updated_at)}
                **Scheduled for:** ${convertTime(updates.scheduled_for)}
                **Scheduled until:** ${convertTime(updates.scheduled_until)}\n
            `)
            addServerStats(embed,updates.components)
            const msg = await channel.send(embed)
        }
    }
    database.ref(`${test_prefix}server_status/scheduled_maintenances`).on('child_added',maintenance)
    database.ref(`${test_prefix}server_status/scheduled_maintenances`).on('child_changed',maintenance)
    database.ref(`${test_prefix}server_status/incidents`).on('child_added',maintenance)
    database.ref(`${test_prefix}server_status/incidents`).on('child_changed',maintenance)
    database.ref(`${test_prefix}server_status_components`).on('child_changed', async function(snapshot) {
        setTimeout( async () => {
            const current_time = new Date().getTime()
            if((current_time - last_update) < 10000){
                return
            }
            const updates = snapshot.val();
            const chennel_list = (await database.ref(`${test_prefix}announce_channels`).once('value')).val()
            for (const key in chennel_list) {
                const channel = await discord.channels.fetch(key)
                const embed = createBasicEmbed()
                addServerStats(embed,updates)
                const msg = await channel.send(embed)
            }
        },5000)
    })
}

const command = async (discord, msg, main_command, args, database) => {
    if(main_command == "announce"){
        const channel = Array.from(msg.mentions.channels.values())[0]
        if(!channel){
            msg.reply("You have to mention a text channel to assign")
            return
        }
        database.ref(`${test_prefix}announce_channels/${channel.id}`).set(channel.name)
        msg.reply(`Sure, I will announce everything in #${channel.name}`)
    }
    if(main_command == "unannounce"){
        const channel = Array.from(msg.mentions.channels.values())[0]
        if(!channel){
            msg.reply("You have to mention a text channel to unassign")
            return
        }
        database.ref(`${test_prefix}announce_channels/${channel.id}`).remove();
        msg.reply(`Sure, I will stop announcing at #${channel.name}`)
    }
};

const listner = async function (discord,database) {
    try {
        const statuspage = new Statuspage(process.env.STATUSPAGE_ID || "stk4xr7r1y0r");
        statuspage.api.getSummary().then(response => {
            const filtered_response = {}
            const components = response.components.filter(x=> x.name.toLowerCase().includes('paladins')).filter(x=> !x.group)
            filtered_response.scheduled_maintenances = response.scheduled_maintenances.filter(x=> x.name.toLowerCase().includes('paladins'))
            filtered_response.incidents = response.incidents.filter(x=> x.name.toLowerCase().includes('paladins'))
            database.ref(`${test_prefix}server_status_components/status`).set(components)
            database.ref(`${test_prefix}server_status`).set(filtered_response)
        });
    } catch (error) {
        console.log(error);
    }
    setTimeout(() => {
        listner(discord,database);
    }, 1000 * 30);
}

module.exports = {init,command}