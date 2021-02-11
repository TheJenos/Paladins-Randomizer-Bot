var _ = require("lodash");
module.exports = async (discord, msg, main_command, args, database) => {
    if(main_command == "serverstatus"){
      const server_status = (await database.ref("server_status").once("value")).val()
      for (const component of server_status.components) {
        msg.reply(`${component.name} is ${component.status}`);
      }
    }
};
