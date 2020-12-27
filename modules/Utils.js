module.exports = (discord, msg, main_command, args) => {
  if (main_command === "invite") {
    const permissions = process.env.DISCORD_PERMISSIONS;
    const client_id = process.env.DISCORD_CLIENT_ID;
    msg.reply(
      `Here is your invite link : https://discord.com/oauth2/authorize?client_id=${client_id}&permissions=${permissions}&scope=bot`
    );
  }
};
