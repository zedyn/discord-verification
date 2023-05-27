const { Client, GatewayIntentBits } = require('discord.js');
const { Handlers } = require('./utils/functions');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

client.config = require('./utils/config');

const handlers = new Handlers(client);

handlers.events();

client.login(client.config.client.token);
