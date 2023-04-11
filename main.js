const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
});

const token = 'YOUR_BOT_TOKEN';
const guildId = 'YOUR_GUILD_ID';

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Register slash commands
    const commands = [{
        name: 'anti-raid',
        description: 'Enable or disable anti-raid mode',
        options: [{
            name: 'enable',
            type: 'BOOLEAN',
            description: 'Enable or disable anti-raid mode',
            required: true
        }]
    }];

    const rest = new REST({ version: '9' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(client.user.id, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'anti-raid') {
        const enabled = interaction.options.getBoolean('enable');

        if (enabled) {
            // Add anti-raid role to all members
            const guild = client.guilds.cache.get(guildId);
            const role = await guild.roles.create({
                name: 'Anti-Raid',
                color: 'RED',
                hoist: true,
                permissions: [],
                reason: 'Anti-Raid mode enabled',
            });

            guild.members.cache.forEach(member => {
                member.roles.add(role);
            });

            await interaction.reply('Anti-Raid mode enabled!');
        } else {
            // Remove anti-raid role from all members
            const guild = client.guilds.cache.get(guildId);
            const role = guild.roles.cache.find(role => role.name === 'Anti-Raid');
            
            if (role) {
                guild.members.cache.forEach(member => {
                    member.roles.remove(role);
                });

                await role.delete('Anti-Raid mode disabled');
                await interaction.reply('Anti-Raid mode disabled!');
            } else {
                await interaction.reply('Anti-Raid mode is not enabled.');
            }
        }
    }
});

client.login(token);
