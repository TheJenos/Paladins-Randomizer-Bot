require("dotenv").config();
const Discord = require("discord.js");
const bot_starter = process.env.BOT_STARTER;
const paladins_data = require("./paladins_data.json");
const utils = require("./utils/Utils.js");
const client = new Discord.Client();
const express = require("express");
const app = express();

var firebase = require("firebase");
var _ = require("lodash");
var http = require("http");
var fs = require("fs");

const ServerStatus = require("./modules/ServerStatus");

let firebaseConfig = null;

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

const store_cfg = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${bot_starter}help`, { type: "LISTENING" });
  ServerStatus.init(client,database);
  updateSession();
});

client.on("message", async (msg) => {
  try {
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
      await ServerStatus.command(
        client,
        msg,
        main_command.toLowerCase(),
        args,
        database
      );
      if (process.env.TEST_MODE) {
        await require("./modules/Test")(
          client,
          msg,
          main_command.toLowerCase(),
          args,
          database
        );
      }
    }
  } catch (error) {
    const user = await client.users.fetch("278900227547725824").catch(() => null);
    user.send(JSON.stringify(error,Object.getOwnPropertyNames(error),4));
    console.log(error);
    database
      .ref("error_logs")
      .push()
      .set({
        error: JSON.parse(
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        ),
        time: new Date().getTime(),
      });
  }
});

function updateSession() {
  const rndChamp = _.shuffle(paladins_data.champions).pop();
  const filename = rndChamp.champion
    .toLowerCase()
    .replace(" ", "-")
    .replace("'", "");
  if (!process.env.TEST_MODE) {
    client.user.setAvatar(
      `https://web2.hirez.com/paladins/champion-icons/${filename}.jpg`
    );
  }
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
});

process.on("unhandledRejection",async function (error) {
  const user = await client.users.fetch("278900227547725824").catch(() => null);
  user.send(JSON.stringify(error,Object.getOwnPropertyNames(error),4));
  database
    .ref("error_logs")
    .push()
    .set({
      error: JSON.parse(
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      ),
      time: new Date().getTime(),
    });
});

process.on("uncaughtException", async function (error) {
  const user = await client.users.fetch("278900227547725824").catch(() => null);
  user.send(JSON.stringify(error,Object.getOwnPropertyNames(error),4));
  database
    .ref("error_logs")
    .push()
    .set({
      error: JSON.parse(
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      ),
      time: new Date().getTime(),
    });
});
