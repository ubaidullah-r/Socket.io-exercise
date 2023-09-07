let app = require('express')();

let http = require('http').Server(app);

let io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile('C:/Users/lenovo/socketIO/day-1/test-project/index.html')

});

var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){
   console.log('someone connected');
   nsp.emit('hi', 'Hello everyone!');
});

// let clients = 0;

// io.on('connection', (socket) =>{
    //console.log('A user is connected');
    
    // setTimeout(()=>{
    //     //predefined event "send" is used to send message to client
    //     //socket.send("sent a message 4 seconds after connecting");

    //     //custom  event is used to send message to client using emit
    //     socket.emit("customEvent", {description:"a custom event named as custom event"});
    // }, 4000);


    //consuming custom client event here to receice message from client
    // socket.on("clientEvent", (data)=>{
    //     console.log(data);
    // });
    // clients++;
     
    //broadcasting message to all clients even who initiated it 
    //io.sockets.emit("broadcast", {description: clients + " clients connected"});

    // socket.emit("newClientEvet", {description: "welcome new client"});

    // socket.broadcast.emit('newClientEvent', {description: clients + " clients connected"})

    // socket.on("disconnect",()=>{
        // clients--;
        // socket.broadcast.emit('newClientEvent', {description: clients + " clients disconnected"})

        //io.sockets.emit("broadcast", {description: clients + " clients disconnected"});


    // })




 

   

// });

http.listen(3000, () =>{
    console.log('app is listening on port 3000')
});