import express from "express";
import ws from 'ws'
import http from 'http';
import path from "path";
import fs from 'fs/promises';
import renderToString from "preact-render-to-string";
import App from "./src/App";
import { type Options, IrcClient } from "twitchts";

const option: Options = {
  identity: {
    user: {
      username: 'albertosaurus_ac',
      token: process.env.token!,
      refreshToken: ``,
      code: ``
    },
    app: {
      clientId: process.env.clientid!,
      secret: process.env.secret!,
      redirect_uri: `https://albertoidesaurus.molikodev.com`,
      events: ['ChannelFollow'],
      actions: ['ModifyChannelInformation', 'SendChatMessage']
    }
  },
  //channels: ["albertosaurus_ac", 'agustabell212', 'M2cG'],
  debug: true,
  testWebsocket: false
}

const http_service = http.createServer();
const app = express();
const wss = new ws.Server({ server: http_service, 'clientTracking': true })
const chat = new IrcClient(option);

app.use(express.static(path.join(__dirname, 'public')));

app.use('*', async (req, res, next) => {
  //const url = req.originalUrl.replace('/', '');

  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'text/javascript');
  }
  next();
})

app.get('*', async (req, res) => {
  try {
    if (req.url.includes('/?channel=')) {
      let channel = new URL(`http://0.0.0.0${req.url}`).searchParams.get('channel');
      if(channel){
        setTimeout(() => {
          chat.JoinChannel(channel!)
        }, 3000)
      }      
    }
    const mainHTML = (await fs.readFile('./index.html', 'utf-8'));

    res.send(mainHTML.replace('@code', renderToString(App({ url: req.url }))));
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
})
wss.setMaxListeners(20);
wss.on('connection', function connection(ws) {
  ws.on('close', () => {
    chat.LeaveChannel(ws.url.replace('/?channel=', ''));  
  })

  chat.on('message', (channel, user, message, self) => {
    if (ws.url.replace('/?channel=', '').toLocaleLowerCase() === channel.toLocaleLowerCase())
      if (!user.source?.isbot)
        ws.send(JSON.stringify({ user: user.tags?.["display-name"]!, message: message.replace(`\s+`, ''), color: user.tags?.color }))
  })

  ws.on('message', () => {
    ws.close();
  })
});

http_service.on('request', app)

http_service.listen(8080, () => {
  console.log(`Server is running http://localhost:8080`);
});