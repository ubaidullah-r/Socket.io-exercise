const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const cors = require('cors');




const mongoURL = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
mongoose.connect(mongoURL, (err)=>{
    if(err) throw err;

});

const app = express();
app.use(express.json());

app.use(cors({
    credentials: true,
    origin:'http://localhost:5173'
}));

app.get('/get', (req,res) => {

    res.json("test,okk");
});

app.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Create a new user and wait for it to be saved
      const createdUser = await User.create({ username, password });
      
      // Sign a JWT token for the user
      const token = jwt.sign({ userId: createdUser._id }, jwtSecret);
      
      // Set the token as a cookie and respond with a success message
      res.cookie('token', token).status(201).json({ message: 'Registration successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Registration failed' });
    }
  });
  


app.listen('4000', ()=>{
    console.log("app is listening on port 4000");
});

