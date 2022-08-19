'use strict';
require('dotenv').config();

const tmi = require('tmi.js');
const fetch = require('node-fetch');
const sanitizeHtml = require('sanitize-html');

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.AUTH_TOKEN,
  },
  channels: [process.env.CHANNEL],
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)

client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect().catch(console.error);

// Function called when the "dice" command is issued
function rollDice() {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

let io;

module.exports = function (app) {
  app.get('/connect/socket', (req, res) => {
    if (!io) {
      const server = req.connection.server;

      const { Server } = require('socket.io');
      io = new Server(server, {
        cors: {
          origin: 'http://localhost:4200',
          methods: ['GET', 'POST'],
        },
      });

      io.on('connection', (socket) => {
        console.log('a sockect has connected');

        socket.on('client message', (msg) => {
          io.emit(msg);
        });
      });
    }

    res.send('created');
  });

  app.get('/login', (req, res) => {
    res.redirect(
      `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=http://localhost:4300/token&response_type=token&scope=channel:read:subscriptions`
    );
  });

  app.get('/subscriptions', (req, res) => {
    return fetch(
      `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${process.env.CHANNEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        res.json(json);
      });
  });

  app.get('/badges', (req, res) => {
    return fetch(`https://api.twitch.tv/helix/chat/badges/global`, {
      headers: {
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        res.json(json);
      });

    // todo merge the response from this request with the json above when I have custom badges
    // fetch(
    //   `https://api.twitch.tv/helix/chat/badges?broadcaster_id=${process.env.CHANNEL_ID}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    //       'Client-Id': process.env.TWITCH_CLIENT_ID,
    //     },
    //   }
    // )
    //   .then((res) => res.json())
    //   .then((json) => {
    //     console.log(json);
    //     res.json(json);
    //   });
  });

  // Called every time a message comes in
  function onMessageHandler(target, context, msg, self) {
    if (self) {
      // Ignore messages from the bot
      return;
    }

    // Remove whitespace from chat message
    const commandName = msg.trim();

    // If the command is known, let's execute it
    if (commandName === '!dice') {
      const num = rollDice();
      client.say(target, `@${context.username} You rolled a ${num}`);
      console.log(`* Executed ${commandName} command`);
    } else {
      if (io && context.username !== 'pretzelrocks') {
        // if this console.log is useful to get your user_id for the .env file
        // console.log({ context, msg, emotes: context.emotes });

        io.emit('chat message', {
          context,
          // we had to make sure to sanitize our input because dragoonbood is a haxor
          msg: sanitizeHtml(msg, {
            allowedTags: [],
          }),
        });
      }
    }
  }
  client.on('message', onMessageHandler);
};
