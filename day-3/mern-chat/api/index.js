const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');





const mongoURL = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
mongoose.connect(mongoURL, (err)=>{
    if(err) throw err;

});

const app = express();
app.use("/uploads", express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,

}));

app.get('/test', (req,res) => {


    res.json("test,okk");
});

async function getUserDataFromRequest(req){
  return new Promise((resolve, reject)=>{
    const token = req.cookies?.token;
    if(token){
    jwt.verify(token, jwtSecret,{}, (err, userData)=>{
      if (err) throw err;
      resolve(userData);

    });
  }else{
    reject('no token');
  }

  });
}
app.get('/messages/:userId', async(req,res)=>{
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender: {$in:[userId, ourUserId]},
    recipient: {$in:[userId, ourUserId]},
  }).sort({createdAt: 1})
  res.json(messages);
});

app.get('/people', async(req,res) => {
  const users = await User.find({},{'_id':1, username:1});
  res.json(users);

})

app.get('/profile', (req, res)=>{
  const token = req.cookies?.token;
  if(token){
    jwt.verify(token, jwtSecret,{}, (err, userData)=>{
      if (err) throw err;
      res.json(userData);

    });
  }

});
app.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Create a new user and wait for it to be saved
      const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
      const createdUser = await User.create({ 
        username:username, 
        password:hashedPassword, 
      });
      
      // Sign a JWT token for the user
      const token = jwt.sign({ userId: createdUser._id, username}, jwtSecret);
      
      // Set the token as a cookie and respond with a success message
      res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({ 
        id: createdUser._id,

      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/login',async(req, res) => {
    
    try
    {
      const {username, password} = req.body;
      const foundUser = await User.findOne({username});
      console.log("user found", foundUser);

      if(foundUser){
        const passOk = bcrypt.compareSync(password,foundUser.password);
        if(passOk){
          jwt.sign({userId:foundUser._id, username}, jwtSecret, {}, (err, token)=>{
            
            res.cookie('token', token,{sameSite:'none', secure:true}).json({
              id: foundUser._id,

            });
          });
        }
        else{
          console.log("wrong credentials")
        }
      }
      

    }catch (err) {
      console.error(err);
      res.status(500).json({ message: 'login failed,try again' });
    }





  });

  app.post('/logout', (req,res) => {
    res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
  });
  


const server = app.listen('4000', ()=>{
    console.log("app is listening on port of web 4000");
});

const wss = new  ws.WebSocketServer({server});

wss.on('connection',(connection,req)=>{
  //read the username and id from cookie when someone connects

  function notifyAboutOnlinePeople(){
    [...wss.clients].forEach(client => {

      client.send(JSON.stringify({
        online:[...wss.clients].map(c => ({userId:c.userId, username:c.username}))
  
      }));
    });
  }
  connection.isAlive = true;
  connection.timer = setInterval(()=>{
    connection.ping();
    connection.deathTimer = setTimeout(()=>{
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople()
      console.log('dead');

    },1000) 
  },5000);

  connection.on("pong",() =>{
    clearTimeout(connection.deathTimer);
  })
  const cookies = req.headers.cookie;
  if(cookies){
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token'));
    if(tokenCookieString){
      const token = tokenCookieString.split('=')[1];
      if(token){
        jwt.verify(token, jwtSecret, {}, (err, userData)=>{
          if(err){ 
            throw err
           }
           const {userId, username} = userData;
           connection.username = username;
           connection.userId = userId;

        });
        
      }
    }
  }

  connection.on('message', async (message) => {
    const messageData = JSON.parse(message.toString());
    const{recipient, text, file} = messageData;
    if(file){
      const parts = file.name.split('.');
      const ext = parts[parts.length - 1];
      const filename = Date.now()+"."+ext;
      const path = __dirname + '/uploads/' + filename;
      const bufferData = Buffer.from(file.data, 'base64');
      fs.writeFile(path, bufferData,()=>{
        console.log("file saved: "+ path);
      });
    }
    console.log(messageData);
    if(recipient, text){
      const messageDoc = await Message.create({
        sender:connection.userId,
        recipient,
        text,
        file: filename || null,
        //id:uuidv4(),

      });

      [...wss.clients]
      .filter(c => c.userId === recipient)
      .forEach(c => c.send(JSON.stringify({
        _id:messageDoc._id,
        text,   
        sender:connection.userId,
        recipient,
        
      })))


      }
    
   


  });

  //notify everyone about online people(when someone connects)
  notifyAboutOnlinePeople();

});

