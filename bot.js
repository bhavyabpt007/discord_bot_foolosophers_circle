const axios = require('axios');
const moment = require('moment');

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Bot token
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';
const ZOOM_API_URL = 'https://api.zoom.us/v2/users/me/meetings';
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

const express = require('express')
const app = express()
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Function to fetch the Zoom access token
async function getZoomAccessToken() {
    try {
      // Generate the Basic Authorization header
      const authHeader = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  
      const response = await axios.post(
        ZOOM_OAUTH_URL,
        new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
          },
        }
      );
  
      console.log('Zoom access token fetched successfully:', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching Zoom access token:', error.response?.data || error.message);
      throw new Error('Failed to fetch Zoom access token.');
    }
}
  

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // Check if the message starts with the command
  if (message.content.startsWith('!schedule')) {
    const args = message.content.split(' ');

    // Extract meeting title and date
    const meetingTitle = args.slice(1, -4).join(' ');
    const dayOfMonth = args[args.length - 3];
    const month = args[args.length - 2];
    const year = args[args.length - 1];

    // Format the date
    const meetingDate = moment(`${month} ${dayOfMonth} ${year}`, 'MMMM DD YYYY').format();

    try {
      // Fetch the access token
      const accessToken = await getZoomAccessToken();

      // Make API call to create Zoom meeting
      const response = await axios.post(
        ZOOM_API_URL,
        {
          topic: meetingTitle,
          type: 2, // Scheduled meeting
          start_time: meetingDate,
          duration: 60, // Default duration of 1 hour
          timezone: 'UTC',
          agenda: `Agenda for ${meetingTitle}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const meetingLink = response.data.join_url;

      // Send the meeting link as a message and pin it
      const meetingMessage = await message.channel.send(
        `Your meeting **${meetingTitle}** has been scheduled for ${meetingDate}. Join here: ${meetingLink}`
      );
      await meetingMessage.pin();
      console.log('Message pinned!');
    } catch (error) {
      console.error('Error scheduling Zoom meeting:', error.response?.data || error.message);
      message.channel.send('Sorry, there was an error scheduling the Zoom meeting.');
    }
  }
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
