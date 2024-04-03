
const currentUrl = window.location.href;
const timeParam = new URL(currentUrl).searchParams.get("time");
const channelParam = new URL(currentUrl).searchParams.get("channel");
const audioParam = new URL(currentUrl).searchParams.get("audio");

if (channelParam) {
    const time = timeParam ? timeParam : 10;
    globalThis.socket = new WebSocket(`ws://localhost:8080?channel=${channelParam}`);

    var messageBody = document.querySelector('.chat');
    messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;

    socket.addEventListener('open', function (event) {
        console.log('WebSocket connection established');
    });

    socket.addEventListener('message', function (event) {
        const msg = JSON.parse(event.data);

        const chatDiv = document.querySelector('.chat');

        if (chatDiv) {
            const audio = document.createElement('audio');
            const audioSource = document.createElement('source');
            const newMessage = document.createElement('div');
            const user = document.createElement('span');
            const message = document.createElement('span');
            let words = msg.message.split(' ');
            const fragment = document.createDocumentFragment();

            newMessage.className = 'newMessage'
            user.className = 'user';
            message.className = 'message';
            user.style = `color: ${msg.color}`;

            if (audioParam) {
                let file = Math.floor(Math.random() * 5)
                audio.autoplay = true;
                audio.controls = false;
                audioSource.src = `/audio/${file}.ogg`
                audioSource.type = 'audio/ogg';
                audio.volume = audioParam;
                audio.appendChild(audioSource);
                newMessage.appendChild(audio);
            }

            let emoteList = {};
            if (msg.emotes) {

                Object.keys(msg.emotes).forEach(d => {
                    msg.emotes[d].forEach(e => {
                        let emo =  msg.message.slice(Number(e.startPosition), Number(e.endPosition)+1);
                        if(!emoteList.hasOwnProperty(emo.trim())){
                            emoteList[emo.trim()] = d;
                        }
                    })
                });
            }

            words.forEach(word => {
                console.log(word)
                if(emoteList.hasOwnProperty(word)){
                    console.log(emoteList[word]);
                    const img = document.createElement('img');
                    img.className = 'emote';
                    img.src = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteList[word]}/default/dark/1.0`;
                    img.alt = word;
                    fragment.appendChild(img)
                }
                else{
                    console.log(word);
                    const span = document.createElement('span');
                    span.textContent = `${word} `;
                    fragment.appendChild(span);
                }
            })

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
        console.log('WebSocket connection closed');
        sleep(2000).then(() => { location.reload(); });
    });

    socket.addEventListener('error', function (event) {
        console.error('WebSocket error:', event);
    });


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
