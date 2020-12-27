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

    const class_list = await utils.multiSelector(
      msg,
      msg.author,
      paladins_data.classes,
      "Please select classes that you like to play"
    );

    database.ref("assigned_users").child(author.id).set(class_list);

    msg.channel.send(
      `<@${author.id}>, You have assigned to the **${class_list.join(
        "**, **"
      )}**`
    );
  } else if (
    main_command == "randomize-map" ||
    main_command == "randomize" ||
    main_command == "randomize-champ-map" ||
    main_command == "randomize-champ"
  ) {
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

    let map = null;

    if (main_command == "randomize" || main_command == "randomize-champ") {
      map = _.shuffle(
        paladins_data.maps.filter((x) => x.type == "Siege")
      ).pop();
    } else {
      const map_types = _.uniqBy(paladins_data.maps, "type").map((x) => x.type);

      const type_list = await utils.multiSelector(
        msg,
        msg.author,
        map_types,
        "Please select map type that you like to play"
      );

      if (type_list == null) {
        return;
      }

      map = _.shuffle(
        paladins_data.maps.filter((x) => type_list.includes(x.type))
      ).pop();
    }

    const player_count = players.length;

    const shuffled_players = _.chunk(_.shuffle(players), player_count / 2);

    let description = `${map.name} (${player_count / 2} vs ${
      player_count / 2
    })\n\n`;

    let filter_class = paladins_data.classes;

    if (
      main_command == "randomize-champ" ||
      main_command == "randomize-champ-map"
    ) {
      filter_class = await utils.multiSelector(
        msg,
        msg.author,
        paladins_data.classes,
        "Please select class that you guys like to play"
      );

      if (filter_class == null) {
        return;
      }
    }

    for (const index in shuffled_players) {
      var t = new Table();

      description += `Team ${index - -1}` + "\n";

      const champs = _.shuffle(
        paladins_data.champions.filter((x) => filter_class.includes(x.class))
      );

      for (const element of shuffled_players[index]) {
        if (element.bot == false) {
          t.cell("Player", element.username);

          if (main_command == "randomize" || main_command == "randomize-map") {
            let datasnap = (
              await database
                .ref("assigned_users")
                .child(element.id)
                .once("value")
            ).val();

            let filterd_champions = paladins_data.champions;

            if (datasnap != null) {
              filterd_champions = filterd_champions.filter((x) =>
                datasnap.includes(x.class)
              );
            } else {
              datasnap = paladins_data.classes;
            }

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
            const shuffled_champions = _.shuffle(filterd_champions).pop();

            t.cell("Champion", shuffled_champions.champion);
          } else {
            t.cell(
              "Classes",
              filter_class
                .map((x) =>
                  x
                    .split(" ")
                    .map((y) => y.substring(0, 1))
                    .join(" ")
                )
                .join(", ")
            );

            const shuffled_champions = champs.pop();

            t.cell("Champion", shuffled_champions.champion);
          }

          t.newRow();
        } else {
          t.cell("Player", "Bot");
          t.cell(
            "Classes",
            filter_class
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

    msg.channel.send("```" + description + "```");
  }
};
