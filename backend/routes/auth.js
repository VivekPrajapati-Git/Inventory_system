const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('../database/supabase_conn')

router.post('/sign_up',async(req,res)=>{
    const {UserName,Password,Role} = req.body

    salted_password = await bcrypt.hash(Password,10)

    const role = Role || 'user';

    const {result,error} = await db.from("Login").insert(
        [{username : UserName,saltedpassword : salted_password,role : role }]).select();

    if (error){
        res.send(error);
    } else{
        res.send("User Successfully Signed Up!")
    }
})

router.post('/login', async (req, res) => {
    try {
        const { UserName, Password } = req.body;

        // 1. Query Supabase for the user
        const { data: user, error } = await db
            .from("Login")
            .select("*")
            .eq("username", UserName)
            .single(); // .single() returns one object instead of an array

        // 2. Handle connection errors or missing users
        if (error || !user) {
            console.error("Login lookup error:", error);
            return res.status(401).send("Invalid Username or Password");
        }

        // 3. Compare passwords (ensure column name matches your DB, e.g., 'Password')
        const isMatch = await bcrypt.compare(Password, user.saltedpassword);

        if (!isMatch) {
            return res.status(401).send("Invalid Username or Password");
        }

        // 4. Generate JWT
        const secret = "your_secret_key";
        const token = jwt.sign(
            { 
                id: user.uniqueid || user.UniqueID, 
                username: user.username || user.UserName, 
                role: user.role || user.Role 
            },
            secret,
            { expiresIn: "24h" }
        );

        // 5. Send success response
        res.json({
            "Message": "Login Successful",
            token: token,
            role: user.role || user.Role
        });

    } catch (err) {
        console.error("Server exception:", err);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router