import React, { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import UserContext from "./UserContext";
import {uniqBy} from "lodash";
const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);
  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };
  const handleMessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    console.log({ev, messageData});
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    }else if('text' in messageData){
      setMessages(prev => ([...prev, {...messageData}]));
    }
    console.log("messages, setMessages", messages);

  };
  const sendMessage = (ev) =>{
    ev.preventDefault();  
    ws.send(JSON.stringify({
      
        recipient: selectedUserId,
        text: newMessageText,
  
    }));
    setNewMessageText("");
    const newMessage = {
      text: newMessageText,
      sender:id,
      recipient: selectedUserId,
    }
    setMessages(prev => {
      console.log(' New Message every time => ', ([...prev, {...newMessage}]))
      return ([...prev, {...newMessage}])
    });

  }
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, 'id');

  
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
              <div className="text-gray-400">&larr; Selected a Person from sidebar</div>
            </div>
          )}
            {!!selectedUserId && (
              <div>
                {messages.map(message => (
                  <div>
                    sender: {message.sender}<br />
                    my id: {id}<br />
                    {message.text}
                    </div>
                ))}
              </div>
            )}
        </div>
        {!!selectedUserId && (
           <form className="flex gap-2" onSubmit={sendMessage}>
           <input
             value={newMessageText}
             onChange={ev => setNewMessageText(ev.target.value)}
             type="text"
             placeholder="type your message here"
             className="bg-white border p-2 flex-grow rounded-sm"
           />
           <button className="bg-blue-500 p-2 text-white rounded-sm" type="submit">
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
