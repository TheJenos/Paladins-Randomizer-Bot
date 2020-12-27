require("dotenv").config();
const Discord = require("discord.js");
var firebase = require("firebase");
const firebaseConfig = require("./firebaseConfig.json");
const bot_starter = process.env.BOT_STARTER;
const store_cfg = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const client = new Discord.Client();
const express = require("express");
var http = require("http");
const app = express();

if (process.env.FIREBASE) {
  firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_ID,
    storageBucket: process.env.FIREBASE_BUCK,
    messagingSenderId: process.env.FIREBASE_MSG_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MES_ID,
  };
} else {
  firebaseConfig = require("./firebaseConfig.json");
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setPresence({
    game: {
      name: "Paladins players",
      type: "WATCHING",
    },
    status: "online",
  });
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

function updateSession() {
  var options = {
    host: process.env.HOST,
    port: 80,
    path: "/",
  };
  http
    .get(options, function (res) {
      res.on("data", function (chunk) {});
    })
    .on("error", function (err) {
      console.log("Error: " + err.message);
    });
  setTimeout(() => {
    updateSession();
  }, 1000 * 60 * 14);
}

app.listen(process.env.PORT || 8080, () => {
  console.log(
    `Test Server http://localhost:` + (process.env.PORT || 8080) + "/"
  );
  client.login(process.env.DISCORD_TOKEN);
  updateSession();
});
