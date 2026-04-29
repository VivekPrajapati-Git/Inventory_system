const express = require('express')
const app = express();

const db = require('./database/sql_connection')
const cors = require('cors')
const mongo_conn = require('./models/mongo_conn')

const authMiddleware = require('./controller/authmiddleware')

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cors())

app.use('/stock',authMiddleware,require('./routes/stocks'));
app.use('/auth',require('./routes/auth'))
app.use('/store',require('./routes/image_store'))
app.use('/sales',authMiddleware,require('./routes/sales'))

app.listen(3000,()=>{
    console.log("Server started at 3000 port !")
})