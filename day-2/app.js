let app = require('express')();

let http = require('http').Server(app);

let io = require("socket.io")(http);

app.get("/", (req, res)=>{

    res.sendFile('C:/Users/lenovo/socketIO/day-2/index.html')
})


let roomno = 1;

io.on('connection',(socket)=>{

    console.log("someone is connected to the server");

    socket.join("room" + roomno);

    io.sockets.in("room" + roomno).emit('connectToRoom', "you are in room no" + roomno);

    setTimeout(()=>{
        socket.leave("room-"+roomno);
        io.sockets.in("room" + roomno).emit('connectToRoom', "you are leaving room no" + roomno);

        console.log("you are leaving room after 2 seconds");
    }, 4000)


});

http.listen("3000", ()=>{
    console.log("app is listening on port on 3000");
})