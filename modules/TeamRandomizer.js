export default (discord) => {
  discord.on("message", (msg) => {
    if (msg.content === "ping") {
      msg.reply("Pong!");
    }
  });
};
