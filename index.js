require("dotenv").config();
const Discord = require("discord.js");
var firebase = require("firebase");
const firebaseConfig = require("./firebaseConfig.json");
const bot_starter = process.env.BOT_STARTER;
const store_cfg = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (msg.content.startsWith(bot_starter)) {
    const filterd_msg = msg.content.substr(bot_starter.length);
    const [main_command, ...args] = filterd_msg.split(" ");
    require("./modules/Utils")(client, msg, main_command.toLowerCase(), args);
    await require("./modules/Basic")(
      client,
      msg,
      main_command.toLowerCase(),
      args
    );
    await require("./modules/Randomizer")(
      client,
      msg,
      main_command.toLowerCase(),
      args,
      database
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
