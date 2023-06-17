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
          if (msg === 'fake-notification') {
            io.emit('notification', {
              meta: {
                message_id: 'Uw5TCRNKMiodDl4Pvbh5kuEa5WgR8JJJP397X-w3pDs=',
                message_type: 'notification',
                message_timestamp: '2023-05-26T15:22:24.77777743Z',
                subscription_type: 'channel.follow',
                subscription_version: '2',
              },
              content: {
                user_id: '42269136',
                user_login: 'dragoonblood',
                user_name: 'dragoonblood',
                broadcaster_user_id: '167191019',
                broadcaster_user_login: 'real_ate',
                broadcaster_user_name: 'real_ate',
                followed_at: '2023-05-26T15:22:24.777768605Z',
              },
            });
            return;
          }
          io.emit(msg);
        });
      });
    }

    res.send('created');
  });

  app.get('/login', (req, res) => {
    res.redirect(
      `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=http://localhost:4300/token&response_type=token&scope=channel:read:subscriptions%20moderator:read:followers%20bits:read`
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

const WebSocket = require('ws');

const ws = new WebSocket('wss://eventsub.wss.twitch.tv/ws');

ws.on('error', console.error);

ws.on('open', function open() {
  console.log('opened');
});

ws.on('close', function close() {
  console.log('notification websocket has closed');
});

async function subscribeForNotifications(session_id) {
  const transport = {
    method: 'websocket',
    session_id,
  };
  const broadcaster_user_id = process.env.CHANNEL_ID;
  const moderator_user_id = process.env.CHANNEL_ID;
  let queries = [
    {
      type: 'channel.subscribe',
      version: '1',
      condition: {
        broadcaster_user_id,
      },
      transport,
    },
    {
      type: 'channel.follow',
      version: '2',
      condition: {
        broadcaster_user_id,
        moderator_user_id,
      },
      transport,
    },
    {
      type: 'channel.subscription.gift',
      version: '1',
      condition: {
        broadcaster_user_id,
      },
      transport,
    },
    {
      type: 'channel.subscription.message',
      version: '1',
      condition: {
        broadcaster_user_id,
      },
      transport,
    },
    {
      type: 'channel.cheer',
      version: '1',
      condition: {
        broadcaster_user_id,
      },
      transport,
    },
  ];

  for (let query of queries) {
    console.log(`subscribing to notification ${query.type}`);
    await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
      body: JSON.stringify(query),
    });
    console.log('done subscribing');
  }
}

ws.on('message', async function message(message) {
  const data = JSON.parse(message);

  switch (data.metadata.message_type) {
    case 'session_welcome':
      console.log('gonna sub for notifications');
      await subscribeForNotifications(data.payload.session.id);
      break;
    case 'session_keepalive':
      // ignore keepalives
      break;
    case 'notification':
      io.emit('notification', data.metadata, data.payload.event);
      break;
    default:
      console.log(
        'unknown message',
        data.metadata.message_type,
        message.toString()
      );
  }
});
