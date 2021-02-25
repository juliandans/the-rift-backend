const connection = require("./connection");

module.exports = connection.model('Paths', { id: { type: String, required: true }, content: { type: String, required: true }, creator: { type: String, required: true }, nsfw: { type: Boolean, required: true }, links: { type: Array, required: true }, permissions:{type: Array, required: false} });