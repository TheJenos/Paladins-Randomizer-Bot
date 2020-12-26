import { Client } from "discord.js";

require("dotenv").config();

const client = new Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

require("./modules/TeamRandomizer")(client);

client.login(process.env.DISCORD_TOKEN);
