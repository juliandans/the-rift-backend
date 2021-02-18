require("dotenv").config();
const express = require('express');
const Paths = require('./db/Paths');
const app = express();
const port = process.env.PORT || 3000
const bp = require('body-parser');

app.use(bp.urlencoded({ extended: false }))
app.use(bp.json())

app.get('/', (req,res) => {
  res.send("hallo")
})

app.get('/search', async (req,res) => {
  const { query: { input } } = req
  const regexp = new RegExp("^"+input,"i");
  const results = await Paths.find({id: regexp})
  res.status(200).json(results);
})

app.post('/signup', async (req,res) => {
  const { body: {name, age} } = req;
  const NewPath = new Paths({id, content, creator, nsfw, links})
  await NewPath.save();
  res.status(200).json(NewPath);
});

app.listen(port, () => {
  console.log("it works")
})