const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const db = require('../database/sql_connection')

router.post('/sign_up',async(req,res)=>{
    const data = req.body

    salted_password = await bcrypt.hash(data.Password,10)

    const role = data.Role || 'user';
    const query = "insert into Login(UserName,SaltedPassword,Role) values(?,?,?)"
    values = [data['UserName'],salted_password,role]
    db.query(query,values,(err,result)=>{
        if (err) {
            console.log(err);
            res.send(err)
        };
        res.send("Successfully Signed Up")
    })
})

router.post('/login',(req,res)=>{
    const data = req.body
    console.log(data)
    const query = "Select * from Login where UserName = ?"
    db.query(query,data.UserName,async(err,result)=>{
        if (err){
            return res.status(401).send("Server Error")
        }

        if (result.length === 0){
            return res.status(401).send("User Not Found")
        }

        password = result[0].SaltedPassword

        match = await bcrypt.compare(data.Password,password)

        if(!match){
            return res.status(401).send("Invalid Username or Password");
        }

        const secret = "your_secret_key";
        const token = jwt.sign(
            {id : result[0].UniqueID,username: result[0].UserName, role: result[0].Role},
            secret,
            {expiresIn : "24h"}
        )

        res.json({
            "Message" : "Login Successful",
            token : token,
            role: result[0].Role
        })
    })
})

module.exports = router