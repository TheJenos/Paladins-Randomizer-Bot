module.exports = (command, msg) => {
  const [main_command, ...args] = command.split(" ");
  if (main_command == "assign") {
    msg.reply("Commonad " + args.join(" "));
  }
};
