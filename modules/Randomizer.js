const paladins_data = require("../paladins_data.json");
const Discord = require("discord.js");
const emoji = require("../utils/emojiCharacters.js");
const utils = require("../utils/Utils.js");
var _ = require("lodash");
const Table = require("easy-table");
const discord_await_time = process.env.DISCORD_AWAIT_TIME;

module.exports = async (discord, msg, main_command, args, database) => {
  if (main_command == "assign") {
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

    database.ref("assigned_users").child(author.id).set(class_list);

    msg.channel.send(
      `<@${author.id}>, You have assigned to the **${class_list.join(
        "**, **"
      )}**`
    );
  } else if (main_command == "randomize") {
    let voice_channels = Array.from(msg.guild.channels.cache.values()).filter(
      (x) => x.type == "voice"
    );

    let sellected_voice_channel = undefined;

    if (args.length > 0) {
      sellected_voice_channel = voice_channels.find((x) => x.name == args[0]);
    }

    if (sellected_voice_channel == undefined) {
      sellected_voice_channel = voice_channels.find(
        (x) =>
          Array.from(x.members.keys()).find((user) => user == msg.author.id) !=
          undefined
      );
    }

    if (sellected_voice_channel == undefined) {
      msg.reply("Sorry i connot find your voice channel");
      return;
    }

    let players = Array.from(sellected_voice_channel.members.values())
      .map((x) => x.user)
      .filter((x) => x.bot == false);

    if (msg.mentions.members.size > 0) {
      players = players.filter(
        (x) => !Array.from(msg.mentions.members.keys()).includes(x.id)
      );
    }

    if (players.length < 1) {
      msg.reply("Sorry there is not enough players to play");
      return;
    }

    if (players.length % 2 != 0) {
      players.push({ username: "bot", bot: true });
    }

    const map =
      paladins_data.maps[Math.floor(Math.random() * paladins_data.maps.length)];

    const player_count = players.length;

    const shuffled_players = _.chunk(_.shuffle(players), player_count / 2);

    // const embed = new Discord.MessageEmbed()
    //   .setColor(utils.getRandomColor())
    //   .setTitle(`${map.name} (${player_count / 2} vs ${player_count / 2})`)
    //   .setAuthor(discord.user.username, discord.user.avatarURL());

    let description = `${map.name} (${player_count / 2} vs ${
      player_count / 2
    })\n\n`;

    for (const index in shuffled_players) {
      var t = new Table();

      // embed.addField(
      //   `Team ${index - -1}`,
      //   index == 0 ? "Left side" : "Right side"
      // );

      description += `Team ${index - -1}` + "\n";

      for (const element of shuffled_players[index]) {
        if (element.bot == false) {
          let datasnap = (
            await database.ref("assigned_users").child(element.id).once("value")
          ).val();

          let filterd_champions = paladins_data.champions;

          if (datasnap != null) {
            filterd_champions = filterd_champions.filter((x) =>
              datasnap.includes(x.class)
            );
          } else {
            datasnap = paladins_data.classes;
          }

          const shuffled_champions = _.shuffle(filterd_champions).pop();

          // embed.addField(
          //   `${element.username} [${datasnap
          //     .map((x) =>
          //       x
          //         .split(" ")
          //         .map((y) => emoji[y.substring(0, 1).toLowerCase()])
          //         .join(" ")
          //     )
          //     .join(", ")}]`,
          //   `${shuffled_champions.champion}`,
          //   true
          // );

          t.cell("Player", element.username);
          t.cell(
            "Classes",
            datasnap
              .map((x) =>
                x
                  .split(" ")
                  .map((y) => y.substring(0, 1))
                  .join(" ")
              )
              .join(", ")
          );
          t.cell("Champion", shuffled_champions.champion);
          t.newRow();
        } else {
          // embed.addField(`Bot`, `Randomly pick by game`, true);

          t.cell("Player", "Bot");
          t.cell(
            "Classes",
            paladins_data.classes
              .map((x) =>
                x
                  .split(" ")
                  .map((y) => y.substring(0, 1))
                  .join(" ")
              )
              .join(", ")
          );
          t.cell("Champion", "Randomly pick by game");
          t.newRow();
        }
      }
      description += t.toString() + "\n";
    }

    // embed.setDescription("```" + description + "```");

    msg.channel.send("```" + description + "```");

    // const bot_msg = await msg.channel.send(embed);
  }
};
