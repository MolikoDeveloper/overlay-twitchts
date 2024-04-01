import express  from "express";
import ws from 'ws'
import http from 'http' ;
import path  from "path";
import fs  from 'fs/promises';
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
  channels: ["albertosaurus_ac", 'agustabell212'],
  debug: true,
  testWebsocket: false
}

const http_service = http.createServer();
const app = express();
const wss =new ws.Server({server: http_service, 'clientTracking': true})
const chat = new IrcClient(option);

app.use(express.static(path.join(__dirname, 'public')));

app.use('*', async (req, res, next) => {
    //const url = req.originalUrl.replace('/', '');
    
    if(req.url.endsWith('.js')){
        res.setHeader('Content-Type', 'text/javascript');
    }
    next();
})

app.get('*', async (req, res) =>{
    try {
        const mainHTML = (await fs.readFile('./index.html', 'utf-8'));

        res.send(mainHTML.replace('@code', renderToString(App({ url: req.url}))));
      } catch (error) {
        res.status(500).send('Internal Server Error');
      }
})

http_service.on('request', app)

wss.on('connection', function connection(ws) {
  chat.on('message', (channel, user, message, self) => {
    if(!user.source?.isbot)
      ws.send(JSON.stringify({user: user.tags?.["display-name"]!, message, color: user.tags?.color}))
  })

  ws.on('message', () => {
    ws.close();
  })
});

http_service.listen(8080, () => {
    console.log(`Server is running http://localhost:8080`);
});