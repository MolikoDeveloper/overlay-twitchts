import http from "http";
import ws from 'ws';
import fs from 'fs';
import renderToString from "preact-render-to-string";
import { type Options, IrcClient } from "twitchts";
import App from "./src/App";

const mimeTypes = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.ico': 'image/x-icon',
    '.ogg': 'audio/ogg'
};

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

const server = http.createServer();
const wss = new ws.Server({ server, clientTracking: true });
const chat = new IrcClient(option);

server.on('request', async (req, res) => {
    //if (req.method != "POST") return res.end();
    const _url = req.url || '';
    const _ip = req.socket.remoteAddress;
    const _mimes = Object.keys(mimeTypes);
    let isStatic: boolean = false;
    let channel = new URL(`http://0.0.0.0${req.url}`).searchParams.get('channel');

    _mimes.forEach((d) => {
        let _contentType = 'text/plain'
        if (_url.endsWith(d)){
            isStatic = true;
            let _file = './wwwroot' + _url;

            fs.readFile(_file, (error, content) => {
                if(!error) {
                    // @ts-ignore
                    _contentType = mimeTypes[d];
                    res.writeHead(200, {'Content-Type': _contentType})
                    res.end(content, 'utf-8')
                }
                else{
                    res.writeHead(500);
                    res.end('Error')
                }
            })
        }
    })

    if(!isStatic){
        res.setHeader('Content-Type', 'text/html');
        res.end((await fs.promises.readFile('./index.html', 'utf-8')).replace('@code', renderToString(App({url: _url}))));
    }

    if(channel){
        setTimeout(() => {
            chat.JoinChannel(channel!)
            }, 3000)
    }

})

wss.setMaxListeners(20);
chat.setMaxListeners(20);
wss.on('connection', function connection(ws) {
  ws.on('close', () => {
    chat.LeaveChannel(ws.url.replace('/?channel=', ''));  
  })

  chat.on('message', (channel, user, message, self) => {
    if (ws.url.replace('/?channel=', '').toLocaleLowerCase() === channel.toLocaleLowerCase())
      if (!user.source?.isbot)
        ws.send(JSON.stringify({ user: user.tags?.["display-name"]!, message: message.replace(`\s+`, ''), color: user.tags?.color, emotes: user.tags?.emotes}))
  });

  ws.on('message', () => {
    ws.close();
  });
});

server.listen(8080, () => {
    console.log(`Server listens on http://localhost:8080`);
});