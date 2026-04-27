const mysql = require('mysql2')

config = {
    host: process.env.SQL_HOST || 'localhost',
    user: process.env.SQL_USER || 'appuser',
    password: process.env.SQL_PASSWORD || 'mypassword',
    database: process.env.SQL_DATABASE || 'Stocks',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

dbConnection = mysql.createConnection(config);

dbConnection.connect((err)=>{
    if (err){
        console.log(err)
    }
    else {
        console.log("MySQL Server Connected!")
    }
});

module.exports = dbConnection;