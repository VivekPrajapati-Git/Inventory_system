const express = require('express')
const app = express();

const cors = require('cors')

const db = require('./database/sql_connection')
const authMiddleware = require('./controller/authmiddleware')

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cors())

app.use('/stock',authMiddleware,require('./routes/stocks'));
app.use('/auth',require('./routes/auth'))

app.listen(3000,()=>{
    console.log("Server started at 3000 port !")
})