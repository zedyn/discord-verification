const { Events } = require('discord.js');
const { Tasks } = require('../utils/functions');

const { connect } = require('mongoose');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.clear();
        console.log('\x1b[32m', `[+] ${client.user.tag} (${client.user.id})`);

        await connect(client.config.mongoose.uri)
            .then(() => console.log('\x1b[32m', '[+] MongoDB'))
            .catch((err) => console.log('\x1b[31m', `[-] MongoDB (${err})`));

        const tasks = new Tasks(client);

        await tasks.registerMessage();
    },
};
