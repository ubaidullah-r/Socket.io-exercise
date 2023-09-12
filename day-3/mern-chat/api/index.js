const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');




const mongoURL = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
mongoose.connect(mongoURL, (err)=>{
    if(err) throw err;

});

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,

}));

app.get('/test', (req,res) => {


    res.json("test,okk");
});
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
      res.status(500).json({ message: 'login failed' });
    }





  });
  


const server = app.listen('4000', ()=>{
    console.log("app is listening on port 4000");
});

const wss = new  ws.WebSocketServer({server});

wss.on('connection',()=>{

  console.log("connected to websocket server")
});