require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Bot token
const TOKEN = process.env.DISCORD_BOT_TOKEN;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.content === '!hello') {
        message.channel.send('Hello, world!');
    }
});

client.on('messageCreate', (message) => {
    if (message.content === '!next meetup') {
        message.channel.send('Im not programmed yet to answer that, but from what I know its 14 december 2024');
    }
});

client.login(TOKEN);
