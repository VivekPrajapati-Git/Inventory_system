const mysql = require('mysql')

config = {
    host: process.env.SQL_HOST || 'localhost',
    user: process.env.SQL_USER || 'root',
    password: process.env.SQL_PASSWORD || 'root',
    database: process.env.SQL_DATABASE || 'Stocks',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

dbConnection = mysql.createConnection(config);

dbConnection.connect((err)=>{
    console.log("MySQL Server Connected !")
});

module.exports = dbConnection;