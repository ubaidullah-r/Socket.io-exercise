import React, { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import UserContext from "./UserContext";
import { uniqBy } from "lodash";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  
  const divUnderMessages = useRef();
  useEffect(() => {
    connectToWs();
    
  }, []);
  function connectToWs(){
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", ()=>{

      setTimeout(() => {
        console.log("disconnect trying to connect")
        connectToWs();
        
      }, 1000);
      
    })

  }
  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };
  const handleMessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    console.log({ ev, messageData });
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };
  const sendMessage = (ev) => {
    ev.preventDefault();
    const resp = ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        
      })
      
    );
    console.log({resp});
    setNewMessageText("");

    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        id: uuidv4(),
        isOur: true,
        sender: id,
        recipient: selectedUserId,
      },
    ]);

  };

  useEffect(()=>{
    const div = divUnderMessages.current;
    if(div){
      div.scrollIntoView({behavior:'smooth', block:'end'}); 

    }

  },[messages])

  useEffect(()=>{
    if(selectedUserId){
      axios.get('/messages/'+selectedUserId).then(res =>{
        console.log(res.data);
        setMessages(res.data);

      });

    }

  },[selectedUserId])

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, "id");

  return (
    <div className="flex h-screen">
      <div className="bg-white-100 w-1/3">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map((userId) => (
          <div
            key={userId}
            onClick={() => setSelectedUserId(userId)}
            className={
              "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
              (userId === selectedUserId ? "bg-blue-50" : "")
            }
          >
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className="text-gray-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex flex-grow h-full items-center justify-center">
              <div className="text-gray-400">
                &larr; Selected a Person from sidebar
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
              {messagesWithoutDupes.map((message) => (
                <div
                  className={
                    message.sender === id ? "text-right" : "text-left"
                  }
                >
                  <div
                    className={
                      "text-left inline-block p-2 my-2 rounded-md text-sm " +
                      (message.sender === id
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-500")
                    }
                  >
                    sender: {message.sender}
                    <br />
                    my id: {id}
                    <br />
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={divUnderMessages}></div>
            </div>
          </div>
          
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              type="text"
              placeholder="type your message here"
              className="bg-white border p-2 flex-grow rounded-sm"
            />
            <button
              className="bg-blue-500 p-2 text-white rounded-sm"
              type="submit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
