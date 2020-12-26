const paladins_data = require("../paladins_data.json");

module.exports = (msg, main_command, args, database) => {
  if (main_command == "assign") {
    let user_id = msg.author.id;
    let class_name = paladins_data.classes.find(
      (x) => x.toLowerCase() == args[0].toLowerCase()
    );
    if (class_name == undefined) {
      msg.reply(
        `Invalid Class name. Use Classes as **${paladins_data.classes.join(
          "**, **"
        )}**`
      );
      return;
    }
    if (msg.mentions.members.size > 0) {
      user_id = msg.mentions.members.first().id;
    }
    database.ref("assigned_users").child(user_id).set(args[0]);
    msg.channel.send(
      `<@${user_id}>, You have assigned to the **${class_name}** Class`
    );
  }
};
