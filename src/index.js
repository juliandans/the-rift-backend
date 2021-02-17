const express = require('express');
const Person = require('./db/Person');
const app = express();
const port = process.env.PORT || 3000

app.get('/', (req,res) => {
  res.send("hallo")
})

app.post('/signup', async (req,res) => {
  const { body: {name, age} } = req;
  const Jeff = new Person({name, age})
  await Jeff.save();
});

app.listen(port, () => {
  console.log("it works")
})