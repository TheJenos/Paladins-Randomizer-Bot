const Discord = require("discord.js");
require("dotenv").config();

const bot_starter = process.env.BOT_STARTER;
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (msg.content.startsWith(bot_starter)) {
    const filterd_msg = msg.content.substr(bot_starter.length);
    require("./modules/InviteLink")(filterd_msg, msg);
    require("./modules/TeamRandomizer")(filterd_msg, msg);
  }
});

client.login(process.env.DISCORD_TOKEN);
