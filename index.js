const Discord = require("discord.js");
require("dotenv").config();

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

require("./modules/TeamRandomizer")(client);

client.login(process.env.DISCORD_TOKEN);
