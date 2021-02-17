const connection = require("./connection");

module.exports = connection.model('Person', { name: String, age: Number });
