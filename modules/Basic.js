const paladins_data = require("../paladins_data.json");
const Discord = require("discord.js");
var _ = require("lodash");
const emoji = require("../utils/emojiCharacters.js");
const utils = require("../utils/Utils.js");
const discord_await_time = process.env.DISCORD_AWAIT_TIME;

module.exports = async (discord, msg, main_command, args) => {
  if (main_command === "rndchamp") {
    let author = msg.author;
    if (msg.mentions.members.size > 0) {
      author = msg.mentions.members.first();
    }

    const class_list = await utils.multiSelector(
      msg,
      msg.author,
      paladins_data.classes,
      "Please select classes that you like to play"
    );

    if (class_list == null) {
      msg.reply("You have to pick a class to continue");
      return;
    }

    const filterd_champions = _.shuffle(
      paladins_data.champions.filter((x) => class_list.includes(x.class))
    ).pop();

    msg.channel.send(
      `<@${author.id}>, You have to play **${filterd_champions.champion}** as in your next game`
    );
  } else if (main_command === "rndmap") {
    const map_types = _.uniqBy(paladins_data.maps, "type").map((x) => x.type);

    const type_list = await utils.multiSelector(
      msg,
      msg.author,
      map_types,
      "Please select map type that you like to play"
    );

    if (type_list == null) {
      msg.reply("You have to pick a map type to continue");
      return;
    }

    const filterd_map = _.shuffle(
      paladins_data.maps.filter((x) => type_list.includes(x.type))
    ).pop();

    msg.channel.send(
      `<@${msg.author.id}>, You guys can try **${filterd_map.name}** for your next game`
    );
  }
};
