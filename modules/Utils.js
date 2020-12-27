module.exports = (discord, msg, main_command, args) => {
  if (main_command === "invite") {
    const permissions = process.env.DISCORD_PERMISSIONS;
    const client_id = process.env.DISCORD_CLIENT_ID;
    msg.reply(
      `Here is your invite link : https://discord.com/oauth2/authorize?client_id=${client_id}&permissions=${permissions}&scope=bot`
    );
  }
  if (main_command === "help") {
    msg.reply(
      "```" +
        "Commands of Paladins Team Randomizer\n\n" +
        "invite -> Give a invite link for the bot\n\n" +
        "rndChamp -> Give a random Champion\n\n" +
        "rndMap -> Give a random Map\n\n" +
        "assign -> Assign to classes that you like to play\n\n" +
        "randomize -> Randomize the map and champions of coustom matches\n\n\n" +
        "```"
    );
  }
};
