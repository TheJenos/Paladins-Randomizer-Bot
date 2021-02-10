const Statuspage = require('statuspage.io').Statuspage
const statuspage = new Statuspage("stk4xr7r1y0r");
module.exports = function (discord,database) {
    statuspage.api.getSummary().then(response => {
        try {
            const filtered_response = {}
            filtered_response.components = response.components.filter(x=> x.name.toLowerCase().includes('paladins'))
            filtered_response.scheduled_maintenances = response.scheduled_maintenances.filter(x=> x.name.toLowerCase().includes('paladins'))
            filtered_response.incidents = response.incidents.filter(x=> x.name.toLowerCase().includes('paladins'))
            database.ref("server_status").set(filtered_response)
        } catch (error) {
            console.log(error);
        }
    });
}