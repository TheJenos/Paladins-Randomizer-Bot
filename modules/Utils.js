module.exports = (discord, msg, main_command, args) => {
  if (main_command === "invite") {
    const permissions = process.env.DISCORD_PERMISSIONS;
    const client_id = process.env.DISCORD_CLIENT_ID;
    msg.reply(
      `Here is your invite link : https://discord.com/oauth2/authorize?client_id=${client_id}&permissions=${permissions}&scope=bot`
    );
  } else if (main_command === "help") {
    msg.reply(
      "```" +
        "Commands of Paladins Team Randomizer\n\n" +
        "invite -> Give a invite link for the bot\n\n" +
        "instractions -> help you to understard the bot\n\n" +
        "rndChamp -> Give a random Champion\n\n" +
        "rndMap -> Give a random Map\n\n" +
        "assign -> Assign to classes that you like to play\n\n" +
        "randomize -> Randomize the map(Siege) and champions of coustom matches\n\n" +
        "randomize-team -> Randomize the team champions of coustom matches\n\n" +
        "randomize-team-champ -> Randomize the team champions(Class Selector) of coustom matches\n\n" +
        "randomize-map -> Randomize the map(Map type Selector) and champions of coustom matches\n\n" +
        "randomize-champ -> Randomize the map(Siege) and champions(Class Selector) of coustom matches\n\n" +
        "randomize-champ-map -> Randomize the map(Map type Selector) and champions(Class Selector) of coustom matches\n\n\n" +
        "```"
    );
  } else if (main_command === "instractions") {
    const starter = process.env.BOT_STARTER;
    msg.reply(`
**Let's start with the basics**

\`\`${starter}assign\`\` will only effects when someone use \`\`${starter}randomize\`\` or \`\`${starter}randomize-map\`\`

\`\`${starter}rndchamp\`\` it's a common thing it will ask what classes that you like then give a random champ

\`\`${starter}rndmap\`\` Same as the \`\`${starter}rndchamp\`\` but maps

**When we come to the randomize command.. there are 4 types randomize commands**

\`\`${starter}randomize\`\` get players that are in your voice chat and randomize them divide them in to 2 team.. if player count is a odd number it will add a bot

\`\`${starter}randomize-team\`\` it will create a team from your voice channel

\`\`${starter}randomize-team-champ\`\` it will ask which type of class that you like to play and it will create a team from your voice channel \`\`${starter}randomize\`\`

\`\`${starter}randomize-map\`\` it will ask which type of map that you like to play and works like normal \`\`${starter}randomize\`\`

\`\`${starter}randomize-champ\`\` it will ask which type of class that you like to play and works like normal \`\`${starter}randomize\`\`

\`\`${starter}randomize-champ\`\` it will ask which type of map and the clas that you like to play and works like normal \`\`${starter}randomize\`\`

If have a **AFK person** on our voice.. So you can use \`\`${starter}randomize <@metion the persons>\`\` so it will ignore them`);
  }
};
