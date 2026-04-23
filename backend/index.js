const express = require('express')
const app = express();

app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello World");
})

app.listen(3000,()=>{
    console.log("Server started at 3000 port !")
})