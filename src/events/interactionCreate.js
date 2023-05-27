const {
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

const codeSchema = require('../schemas/codes');
const nodemailer = require('nodemailer');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        const lang = interaction.client.config.lang == 'tr';

        if (interaction.customId == 'openMailForm') {
            const modal = new ModalBuilder()
                .setCustomId('mailForm')
                .setTitle(lang ? 'Doğrulama' : 'Verifaction');

            const mail = new TextInputBuilder()
                .setCustomId('mailInput')
                .setStyle(TextInputStyle.Short)
                .setLabel(lang ? 'Mail Adresiniz:' : 'Your Mail Address:')
                .setPlaceholder(lang ? 'örnek@example.com' : 'someone@example.com');

            const field = new ActionRowBuilder().addComponents(mail);

            modal.addComponents(field);

            await interaction.showModal(modal);
        }

        if (interaction.customId == 'mailForm') {
            await interaction.deferReply({ ephemeral: true });

            const mail = interaction.fields.getTextInputValue('mailInput');

            const embed = new EmbedBuilder()
                .setColor(interaction.message.embeds[0].color)
                .setAuthor({
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    name: `${interaction.user.tag} (${interaction.user.id})`,
                })
                .setDescription(
                    lang
                        ? 'Mail adrsinin doğru ve size ait olduğunu kabul edip doğrulama kodunu almak istiyorsanız aşağıdaki ilgili tuşa tıklayın.'
                        : 'If you want to confirm that the email address is correct and belongs to you in order to receive the verification code, please click on the relevant button below.'
                )
                .addFields({
                    name: lang ? 'Mail Adresiniz:' : 'Your Mail Address:',
                    value: mail,
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('sendVerifactionCode')
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(lang ? 'Doğrulama Kodunu Gönder' : 'Send Verifaction Code'),
                new ButtonBuilder()
                    .setCustomId('approveCode')
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(lang ? 'Kodu Doğrula' : 'Approve Code')
                    .setDisabled(true)
            );

            await interaction.editReply({
                embeds: [embed],
                components: [row],
            });
        }

        if (interaction.customId == 'sendVerifactionCode') {
            const row = ActionRowBuilder.from(interaction.message.components[0]);
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);

            const code = Math.floor(Math.random() * 900000) + 100000;

            await codeSchema.findByIdAndUpdate(
                interaction.user.id,
                { $set: { code } },
                { upsert: true }
            );

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: interaction.client.config.google.mail,
                    pass: interaction.client.config.google.password,
                },
            });

            const options = {
                from: `"${interaction.client.config.options.mailTitle}" <${interaction.client.config.google.mail}>`,
                to: `${interaction.message.embeds[0].data.fields[0].value}`,
                subject: `${interaction.client.config.options.mailSubject}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Doğrulama Kodu</title>
                        <style>
                            body {
                            background-color: #f2f2f2;
                            font-family: Arial, sans-serif;
                            }

                            .container {
                            max-width: 400px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #ffffff;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            }

                            h1 {
                            text-align: center;
                            color: #333333;
                            }

                            .verification-code {
                            text-align: center;
                            font-size: 28px;
                            font-weight: bold;
                            color: #333333;
                            margin-top: 30px;
                            }

                            .instructions {
                            text-align: center;
                            color: #666666;
                            margin-top: 10px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>${lang ? 'Doğrulama Kodu' : 'Verifaction Code'}</h1>
                            <div class="verification-code">${code}</div>
                            <div class="instructions">
                                ${
                                    lang
                                        ? 'Yukardaki doğrulama kodunu, Discord\'da aktif olan "Kodu Doğrula" butonuna tıklayarak karşınıza çıkan forma girin ve doğrulama işlemini sonlandırın.'
                                        : 'Enter the above verification code into the form that appears when you click the "Approve Code" button in Discord and complete the verification process.'
                                }
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            };

            transporter.sendMail(options, async function (error, info) {
                if (error) {
                    console.log('\x1b[31m', `[-] Mail gönderilmedi. (${error})`);

                    return await interaction.update({
                        content: lang
                            ? 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.'
                            : 'An error occurred, please try again later.',
                        embeds: [],
                        components: [],
                    });
                }
            });

            row.components[0].setStyle(ButtonStyle.Success);
            row.components[0].setDisabled(true);

            row.components[1].setStyle(ButtonStyle.Primary);
            row.components[1].setDisabled(false);

            await interaction.update({
                content: lang
                    ? 'Doğrulama kodu gönderildi.'
                    : 'The verification code has been sent.',
                embeds: [embed],
                components: [row],
            });
        }

        if (interaction.customId == 'approveCode') {
            const modal = new ModalBuilder()
                .setCustomId('approveCodeForm')
                .setTitle(lang ? 'Doğrulama' : 'Verifaction');

            const code = new TextInputBuilder()
                .setCustomId('codeInput')
                .setStyle(TextInputStyle.Short)
                .setLabel(lang ? 'Kodu Girin:' : 'Enter The Code:')
                .setPlaceholder('000000');

            const field = new ActionRowBuilder().addComponents(code);

            modal.addComponents(field);

            await interaction.showModal(modal);
        }

        if (interaction.customId == 'approveCodeForm') {
            const code = interaction.fields.getTextInputValue('codeInput');

            const row = ActionRowBuilder.from(interaction.message.components[0]);
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);

            const data = await codeSchema.findById(interaction.user.id);

            if (code != data.code) {
                row.components[1].setStyle(ButtonStyle.Danger);

                embed.setDescription(
                    lang
                        ? 'Girilen kod eşleşmiyor, lütfen tekrar deneyin.'
                        : 'The entered code does not match, please try again.'
                );

                return await interaction.update({
                    embeds: [embed],
                    components: [row],
                });
            }

            row.components[1].setStyle(ButtonStyle.Success);
            row.components[1].setDisabled(true);

            embed.setDescription(
                lang
                    ? 'Doğrulama başarılı, kayıt işlemleri gerçekleştiriliyor...'
                    : 'Verification successful, registration processes are being carried out...'
            );

            await interaction.update({
                embeds: [embed],
                components: [row],
            });

            await codeSchema.findByIdAndDelete(interaction.user.id);

            try {
                if (interaction.client.config.roles.retrievedRole.length > 0) {
                    interaction.client.config.roles.retrievedRole.some(
                        async (role) => await interaction.member.roles.remove(role)
                    );
                }

                if (interaction.client.config.roles.assignedRole.length > 0) {
                    interaction.client.config.roles.assignedRole.some(
                        async (role) => await interaction.member.roles.add(role)
                    );
                }
            } catch {
                return;
            }
        }
    },
};
