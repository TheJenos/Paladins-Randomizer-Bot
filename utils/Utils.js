const Discord = require("discord.js");
const discord_await_time = process.env.DISCORD_AWAIT_TIME;
const emoji = require("../utils/emojiCharacters.js");

var http = require("https"),
  Stream = require("stream").Transform,
  fs = require("fs");

module.exports.download = (uri, filename, callback) => {
  http
    .request(uri, function (response) {
      var data = new Stream();

      response.on("data", function (chunk) {
        data.push(chunk);
      });

      response.on("end", function () {
        fs.writeFileSync(filename, data.read());
        callback();
      });
    })
    .end();
};

module.exports.getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

module.exports.getRandomColor = () => {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

module.exports.multiSelector = async (msg, author, options, title) => {
  const embed = new Discord.MessageEmbed()
    .setColor(this.getRandomColor())
    .setAuthor(author.username, author.avatarURL());

  let discription = `${title}\n\n`;

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

  options.forEach((option) => {
    discription += `:${numbers.shift()}: ${option}\n\n`;
  });

  discription += "You can start react after appiring numbers";

  embed.setDescription(discription);

  const bot_msg = await msg.channel.send(embed);

  const emoji_must = [];

  for (let index = 1; index <= options.length; index++) {
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
      max: options.length,
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

  return Array.from(result.keys())
    .map((x) => this.getKeyByValue(emoji, x))
    .filter((x) => x != undefined)
    .map((x) => options[x - 1]);
};
