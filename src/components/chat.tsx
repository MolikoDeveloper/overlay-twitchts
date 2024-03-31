const Chat = () => {  
  const css = /*CSS*/`
  .chat{
    overflow-y: auto;
    height: 590px;
    display: flex;
    flex-direction: column-reverse;
    font-size: 30px;
    color: white;
    font-weight: 1000px;
    margin-left: 10px;
    margin-right: 10px;
    scrollbar-width: unset;
    -ms-overflow-style: none;
  }

  .chat::-webkit-scrollbar {
    display: none;
  }

  .newMessage{
    display: block ruby;
    margin-top: 10px;
    overflow-wrap: pretty;
    padding-bottom: 5px;
  }
  .user{
    font-weight: 700;
    text-shadow: 0 0 1px white, 0 0 1px black;
  }
  .message{
    text-shadow: 0 0 3px #FF0000, 0 0 5px #0000FF;
  }
`;

  return (
    <>
      <style>{css}</style>
      <div class="chat">
      </div>
    </>
  )
};

export default Chat;