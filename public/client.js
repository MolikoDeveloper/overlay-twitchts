globalThis.socket = new WebSocket('ws://localhost:8080');
    
var messageBody = document.querySelector('.chat');
messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;

socket.addEventListener('open', function (event) {
    console.log('WebSocket connection established');
});

socket.addEventListener('message', function (event) {
    const msg = JSON.parse(event.data);

    const chatDiv = document.querySelector('.chat');

    if(chatDiv){
        const newMessage = document.createElement('div');
        const user = document.createElement('span');
        const message = document.createElement('span');

        newMessage.className = 'newMessage'
        user.className = 'user';
        message.className = 'message';

        newMessage.style = `font-family: "Inter","Roobert","Helvetica Neue",Helvetica,Arial,sans-serif;`
        user.style = `color: ${msg.color}`;

        user.textContent = msg.user;
        message.textContent = `: ${msg.message}`;
        
        newMessage.appendChild(user);
        newMessage.appendChild(message);

        chatDiv.prepend(newMessage);

        setTimeout(function() {
            newMessage.remove();
        }, 8000);
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