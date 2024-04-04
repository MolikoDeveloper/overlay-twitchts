
const currentUrl = window.location.href;
const timeParam = new URL(currentUrl).searchParams.get("time");
const channelParam = new URL(currentUrl).searchParams.get("channel");
const audioParam = new URL(currentUrl).searchParams.get("audio");


let _7tvEmotes = [];
let emoteList = {};
let _7tvemoteList = {}

let _7tvGlobalEmotes = fetch(`https://7tv.io/v3/emote-sets/global`).then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}).then(data => {
    return data.emotes.map((emote) => {
        return { name: emote.name, id: emote.id };
    })
})

await _7tvGlobalEmotes.then(d => {
    d.forEach(e => {
        _7tvemoteList[e.name] = e.id;
    })
});

if (channelParam) {
    let socket = new WebSocket(`ws://localhost:8080?channel=${channelParam}`);

    const time = timeParam ? timeParam : 10;

    var messageBody = document.querySelector('.chat');
    messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;

    const audio = document.createElement('audio');
    audio.autoplay = false;
    audio.controls = false;
    audio.volume = audioParam;

    const audioSource = {
        0: document.createElement('source'),
        1: document.createElement('source'),
        2: document.createElement('source'),
        3: document.createElement('source'),
        4: document.createElement('source')
    }
    for (let i = 0; i < 5; i++) {
        audioSource[i].src = `/audio/${i}.ogg`
        audioSource[i].type = 'audio/ogg';
        audio.appendChild(audioSource[i]);
    }

    socket.addEventListener('message', async function (event) {
        const msg = JSON.parse(event.data);
        if (_7tvEmotes.length === 0) {
            _7tvEmotes = fetch(`https://7tv.io/v3/users/twitch/${msg.channel.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    return data.emote_set.emotes.map((emote) => {
                        return { name: emote.name, id: emote.id };
                    });
                })
                .catch(error => {
                    console.error('There was a problem getting the emote:', error);
                });
        }

        const chatDiv = document.querySelector('.chat');

        if (chatDiv) {
            const newMessage = document.createElement('div');
            const user = document.createElement('span');
            const message = document.createElement('span');
            const words = msg.message.split(' ');
            const fragment = document.createDocumentFragment();

            newMessage.className = 'newMessage'
            user.className = 'user';
            message.className = 'message';
            user.style = `color: ${msg.color}`;

            if (audioParam) {
                let file = Math.floor(Math.random() * 5)
                let _audio = document.createElement('audio');
                let _audiosource = audio.querySelectorAll('source')[file];
                console.log(file, _audiosource);
                if (_audiosource) {
                    _audio.controls = false;
                    _audio.autoplay = true;

                    _audio.appendChild(_audiosource);
                    newMessage.appendChild(_audio.cloneNode(true));
                }
            }

            if (msg.emotes) {
                Object.keys(msg.emotes).forEach(d => {
                    msg.emotes[d].forEach(e => {
                        let emo = msg.message.slice(Number(e.startPosition), Number(e.endPosition) + 1);
                        if (!emoteList.hasOwnProperty(emo.trim())) {
                            emoteList[emo.trim()] = d;
                        }
                    })
                });
            }

            await _7tvEmotes.then(d => {
                d.forEach(e => {
                    if(!_7tvemoteList[e.name])
                        _7tvemoteList[e.name] = e.id;
                })
            });

            for (let word of words) {
                if (emoteList.hasOwnProperty(word)) {
                    const img = document.createElement('img');
                    img.className = 'emote';
                    img.src = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteList[word]}/default/dark/1.0`;
                    img.loading = 'lazy';
                    img.alt = word;
                    fragment.appendChild(img);
                }
                else if (_7tvemoteList.hasOwnProperty(word)) {
                    const img = document.createElement('img');
                    const src = `https://cdn.7tv.app/emote/${_7tvemoteList[word]}/1x.avif`;
                    img.className = 'emote';
                    img.src = src;
                    img.alt = word;
                    fragment.appendChild(img);

                }
                else {
                    const span = document.createElement('span');
                    span.textContent = `${word} `;
                    fragment.appendChild(span);
                }
            }

            user.textContent = msg.user + ': ';
            //message.textContent = `: ${msg.message}`;
            message.appendChild(fragment);

            newMessage.appendChild(user);
            newMessage.appendChild(message);


            chatDiv.prepend(newMessage);

            setTimeout(function () {
                newMessage.remove();
            }, Number(time) * 1000);
        }
    });

    socket.addEventListener('close', function (event) {
        sleep(2000).then(() => { location.reload(); });
    });

    socket.addEventListener('error', function (event) {
        console.error('WebSocket error:', event);
    });


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}