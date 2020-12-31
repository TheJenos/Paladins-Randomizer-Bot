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

    if (class_list == null) {
      msg.reply("You have to pick a class to continue");
      return;
    }

    database.ref("assigned_users").child(author.id).set(class_list);

    msg.channel.send(
      `<@${author.id}>, You have assigned to the **${class_list.join(
        "**, **"
      )}**`
    );
  } else if (
    main_command == "randomize" ||
    main_command == "randomize-map" ||
    main_command == "randomize-comp" ||
    main_command == "randomize-comp-map" ||
    main_command == "randomize-champ" ||
    main_command == "randomize-champ-map"
  ) {
    let sellected_voice_channel = msg.member.voice.channel;

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

    if (
      main_command == "randomize" ||
      main_command == "randomize-champ" ||
      main_command == "randomize-comp"
    ) {
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
        msg.reply("You have to pick a map type to continue");
        return;
      }

      map = _.shuffle(
        paladins_data.maps.filter((x) => type_list.includes(x.type))
      ).pop();
    }

    const player_count = players.length;

    const shuffled_players = _.chunk(_.shuffle(players), player_count / 2);

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
        msg.reply("You have to pick a class to continue");
        return;
      }
    }

    let comp = paladins_data.comps[0];

    let comp_name = "Default Comp"

    if (
      main_command == "randomize-comp" ||
      main_command == "randomize-comp-map"
    ) {
      comp_name = await utils.multiSelector(
        msg,
        msg.author,
        paladins_data.comps.map((x) => x.name),
        "Please select a comp that you guys like to play",
        1
      );

      if (comp_name == null) {
        msg.reply("You have to pick a comp to continue");
        return;
      }

      comp = paladins_data.comps.find((x) => x.name == comp_name);

      if (player_count / 2 > comp.classes.length) {
        msg.reply(
          `You must have a maximum of ${comp.classes.length} people on each team`
        );
        return;
      }
    }

    let description = `${map.name} (${player_count / 2} vs ${
      player_count / 2
    })  (${comp_name})\n\n`;

    for (const index in shuffled_players) {
      var t = new Table();

      description += `Team ${index - -1}` + "\n";

      let champs = _.shuffle(
        paladins_data.champions.filter((x) => filter_class.includes(x.class))
      );

      let champs_full = _.shuffle(paladins_data.champions);

      for (const player_index in shuffled_players[index]) {
        if (
          main_command == "randomize-comp" ||
          main_command == "randomize-comp-map"
        ) {
          filter_class = [comp.classes[player_index]];
          champs = _.shuffle(
            paladins_data.champions.filter(
              (x) => x.class == comp.classes[player_index]
            )
          );
        }

        const element = shuffled_players[index][player_index];
        if (element.bot == false) {
          t.cell("Player", element.username);

          if (main_command == "randomize" || main_command == "randomize-map") {
            let datasnap = (
              await database
                .ref("assigned_users")
                .child(element.id)
                .once("value")
            ).val();

            let filterd_champions = champs_full;

            if (datasnap != null) {
              filterd_champions = champs_full.filter((x) =>
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

            const temp_champ_list = _.shuffle(filterd_champions);
            const shuffled_champions = temp_champ_list.pop();

            champs_full = champs_full.filter(
              (x) => x.champion != shuffled_champions.champion
            );

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
  } else if (
    main_command == "randomize-team" ||
    main_command == "randomize-team-comp" ||
    main_command == "randomize-team-champ"
  ) {
    let sellected_voice_channel = msg.member.voice.channel;

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

    players = _.shuffle(players)

    let filter_class = paladins_data.champions;

    if (main_command == "randomize-team-champ") {
      filter_class = await utils.multiSelector(
        msg,
        msg.author,
        paladins_data.classes,
        "Please select class that you guys like to play"
      );

      if (filter_class == null) {
        msg.reply("You have to pick a class to continue");
        return;
      }
    }

    let comp_name = "Default Comp"

    if (main_command == "randomize-team-comp") {
      comp_name = await utils.multiSelector(
        msg,
        msg.author,
        paladins_data.comps.map((x) => x.name),
        "Please select a comp that you guys like to play",
        1
      );

      if (comp_name == null) {
        msg.reply("You have to pick a comp to continue");
        return;
      }

      comp = paladins_data.comps.find((x) => x.name == comp_name);

      if (players.length > comp.classes.length) {
        msg.reply(
          `You must have a maximum of ${comp.classes.length} people on team`
        );
        return;
      }
    }

    var t = new Table();

    let champs = _.shuffle(
      paladins_data.champions.filter((x) => filter_class.includes(x.class))
    );

    let champs_full = _.shuffle(paladins_data.champions);

    for (const player_index in players) {
      const element = players[player_index];

      t.cell("Player", element.username);

      if (main_command == "randomize-team-comp") {
        filter_class = [comp.classes[player_index]];
        champs = _.shuffle(
          paladins_data.champions.filter(
            (x) => x.class == comp.classes[player_index]
          )
        );
      }

      if (main_command == "randomize-team") {
        let datasnap = (
          await database.ref("assigned_users").child(element.id).once("value")
        ).val();

        let filterd_champions = champs_full;

        if (datasnap != null) {
          filterd_champions = champs_full.filter((x) =>
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

        const temp_champ_list = _.shuffle(filterd_champions);
        const shuffled_champions = temp_champ_list.pop();

        champs_full = champs_full.filter(
          (x) => x.champion != shuffled_champions.champion
        );

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
    }
    
    msg.channel.send("```"+`${comp_name} \n\n ${t.toString()}` + "```");
  }
};
