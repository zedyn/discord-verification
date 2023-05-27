const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const path = require('node:path');
const fs = require('node:fs');

class Handlers {
    constructor(client) {
        this.client = client;
    }

    events() {
        const eventsPath = path.join(__dirname, '../events');
        const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);

            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
}

class Tasks {
    constructor(client) {
        this.client = client;
        this.config = client.config;
    }

    async registerMessage() {
        const channel = this.client.channels.cache.get(this.config.channels.registerChannelId);

        if (!channel) {
            return console.log(
                '\x1b[31m',
                '[-] Register channel is not found, please check the config file.'
            );
        }

        const lang = this.config.lang == 'tr';
        const color = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.config.options.embedColor);

        const embed = new EmbedBuilder()
            .setColor(color ? this.config.options.embedColor : 0x2b2d31)
            .setTitle(lang ? 'Doğrulama' : 'Verifaction')
            .setDescription(
                lang
                    ? 'Kayıt olmak için aşağıdaki butona tıklayın ve karşınıza çıkan forma mail adresinizi girin, daha sonra mail adresinize bir doğrulama kodu göndereceğiz.'
                    : 'To register, click on the button below and enter your email address into the form that appears. Afterwards, we will send a verification code to your email address'
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('openMailForm')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✉️')
        );

        await channel.messages.fetch();

        if (channel.lastMessage && channel.lastMessage.author.id == this.client.user.id) {
            return await channel.lastMessage.edit({
                embeds: [embed],
                components: [row],
            });
        }

        await channel.send({
            embeds: [embed],
            components: [row],
        });
    }
}

module.exports = {
    Handlers,
    Tasks,
};
