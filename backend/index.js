const express = require('express')
const app = express();

const cors = require('cors')

const db = require('./database/sql_connection')

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cors())

app.use('/stock',require('./routes/stocks'));

app.listen(3000,()=>{
    console.log("Server started at 3000 port !")
})