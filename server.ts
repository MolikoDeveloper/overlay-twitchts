import { serve, file } from 'bun';
import App from './src/App';
import renderToString from 'preact-render-to-string';
import { type Options, IrcClient } from 'twitchts';

const NOTACCEPT = ["POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
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

const chat = new IrcClient(option);
chat.setMaxListeners(100);

serve({
  //development: true,
  async fetch(req, server) {
    const url = new URL(req.url)
    let channel = url.searchParams.get('channel');
    if (url.pathname.includes('..')) {
      return;
    }
    // request to WebSocket
    if (server.upgrade(req, { data: { channel: channel } })) {
      return;
    }

    // GET
    if (!NOTACCEPT.includes(req.method)) {
      let isStatic: boolean = false;
      let _file = __dirname + '/wwwroot' + url.pathname;

      let staticfile = file(_file);
      if (await staticfile.exists()) {
        return new Response(staticfile);
      }
      // return webpage
      else {
        if (!url.pathname.startsWith('/api')) {
          const app = (await file('./index.html').text()).replace('@code', renderToString(App({ url: url.pathname })));
          return new Response(app, { status: 200, 'headers': { 'Content-Type': 'text/html' } });
        }
      }
    }
  },
  websocket: {
    sendPings: true,
    idleTimeout: 10,
    message(ws, message) {
      if (message != "PONG")
        ws.close();
    },
    close(ws) {
      // @ts-ignore
      const channel = ws.data?.channel;
      if (channel) {

        chat.LeaveChannel(channel)
        chat.Close();
        ws.close();
      }
    },
    open(ws) {
      // @ts-ignore
      const channel: string = ws.data?.channel;
      let _channelInfo: { name: string, id: string } = { name: '', id: '' };

      setTimeout(() => {
        chat.JoinChannel(channel!)
      }, 3000)

      chat.on('userstate', (channel, userstate) => {
        if (channel?.toLocaleLowerCase() === channel.toLocaleLowerCase())
          _channelInfo = { name: channel, id: userstate["room-id"]! }
      })

      chat.on('message', (channel, user, message, self) => {
        ws.send(JSON.stringify({
          channel: _channelInfo,
          user: user.tags?.["display-name"]!,
          message: message.replace(`\s+`, ''),
          color: user.tags?.color,
          emotes: user.tags?.emotes
        }))
      })
    },
  },
  port: 8080
});