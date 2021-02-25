require("dotenv").config();
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const cors = require("cors");
const express = require('express');
const session = require('express-session')
const cookieParser = require('cookie-parser')
const Paths = require('./db/Path');
const app = express();
const port = process.env.PORT || 3001
const bp = require('body-parser');
const User = require("./db/User")

app.use(bp.urlencoded({ extended: false }))
app.use(bp.json())
app.use(cors())
app.set('trust proxy', 1)
app.use(cookieParser())
app.use(session({
  secret: 'some big environment secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, maxAge: 10000000 }
}))

const isAuthenticated = async (req, _res, next) => {
  console.log(Object.keys(req.session))
  const currentUser = await User.findById(req.session.userId)
  if (currentUser) {
    req.currentUser = currentUser
    next()
  } else {
    next(new Error(`You're not logged in!`))
  }
}

app.get('/', (req,res) => {
  res.send("hallo")
})

app.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json(req.currentUser)
})

app.get('/protected', isAuthenticated, (req, res) => {
  res.status(200).send(`You're logged in as ${req.currentUser.email}`)
})

app.get('/return', async (req,res) => {
  const { query: { input } } = req
  const regexp = new RegExp("^"+input,"i");
  const results = await Paths.find({id: regexp})
  res.status(200).json(results);
})

app.post('/new', async (req,res) => {
  const { body: {name, age} } = req;
  const NewPath = new Paths({id, content, creator, nsfw, links})
  await NewPath.save();
  res.status(200).json(NewPath);
});

app.post('/authenticate', async (req, res) => {
  const { body: {token} } = req
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const { email, picture, given_name, family_name } = ticket.getPayload();
  const existingUser = await User.findOne({email})
  if (!existingUser) {
    const newUser = new User({firstname:given_name, lastname:family_name,email,avatar:picture})    
    await newUser.save();
    req.session.userId = newUser._id
    res.status(201).json(newUser);
  } else { 
    req.session.userId = existingUser._id
    res.status(200).json(existingUser);
  }
}) 

app.listen(port, () => {
  console.log("it works")
})