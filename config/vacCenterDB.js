const mysql = require("mysql2");

var connection = mysql.createPool({
    host: 'localhost',
    user:'hosioka',
    password: 'oon11082005',
    database: 'vacCenter'
});

module.exports = connection;