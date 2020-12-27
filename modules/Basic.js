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
    const embed = new Discord.MessageEmbed()
      .setColor(utils.getRandomColor())
      .setAuthor(author.username, author.avatarURL());

    let discription = "Please select classes that you like to play\n\n";

    const numbers = [
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ];

    paladins_data.classes.forEach((class_name) => {
      discription += `:${numbers.shift()}: ${class_name}\n\n`;
    });

    discription += "You can start react after appiring numbers";

    embed.setDescription(discription);

    const bot_msg = await msg.channel.send(embed);

    const emoji_must = [];

    for (let index = 1; index <= paladins_data.classes.length; index++) {
      emoji_must.push(emoji[index]);
      await bot_msg.react(emoji[index]);
    }

    let result = null;

    try {
      const filter = (reaction, user) => {
        return (
          emoji_must.includes(reaction.emoji.name) &&
          (user.id === msg.author.id || user.id === author.id)
        );
      };

      const collected = await bot_msg.awaitReactions(filter, {
        max: paladins_data.classes.length,
        time: discord_await_time,
        errors: ["time"],
      });

      result = collected;
    } catch (error) {
      if (error.size < 1) {
        await bot_msg.delete();
        return;
      }

      result = error;
    }

    await bot_msg.delete();

    const class_list = Array.from(result.keys())
      .map((x) => utils.getKeyByValue(emoji, x))
      .filter((x) => x != undefined)
      .map((x) => paladins_data.classes[x - 1]);

    const filterd_champions = _.shuffle(
      paladins_data.champions.filter((x) => class_list.includes(x.class))
    ).pop();

    msg.channel.send(
      `<@${author.id}>, You have to play **${filterd_champions.champion}** as in your next game`
    );
  } else if (main_command === "rndmap") {
    let author = msg.author;

    const embed = new Discord.MessageEmbed()
      .setColor(utils.getRandomColor())
      .setAuthor(author.username, author.avatarURL());

    let discription = "Please select map type that you like to play\n\n";

    const numbers = [
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ];

    const map_types = _.uniqBy(paladins_data.maps, "type").map((x) => x.type);

    map_types.forEach((type) => {
      discription += `:${numbers.shift()}: ${type}\n\n`;
    });

    discription += "You can start react after appiring numbers";

    embed.setDescription(discription);

    const bot_msg = await msg.channel.send(embed);

    const emoji_must = [];

    for (let index = 1; index <= map_types.length; index++) {
      emoji_must.push(emoji[index]);
      await bot_msg.react(emoji[index]);
    }

    let result = null;

    try {
      const filter = (reaction, user) => {
        return (
          emoji_must.includes(reaction.emoji.name) &&
          (user.id === msg.author.id || user.id === author.id)
        );
      };

      const collected = await bot_msg.awaitReactions(filter, {
        max: map_types.length,
        time: discord_await_time,
        errors: ["time"],
      });

      result = collected;
    } catch (error) {
      if (error.size < 1) {
        await bot_msg.delete();
        return;
      }

      result = error;
    }

    await bot_msg.delete();

    const type_list = Array.from(result.keys())
      .map((x) => utils.getKeyByValue(emoji, x))
      .filter((x) => x != undefined)
      .map((x) => map_types[x - 1]);

    const filterd_map = _.shuffle(
      paladins_data.maps.filter((x) => type_list.includes(x.type))
    ).pop();

    msg.channel.send(
      `<@${author.id}>, You guys can try **${filterd_map.name}** for your next game`
    );
  }
};
