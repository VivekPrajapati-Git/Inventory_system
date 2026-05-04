const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('../database/supabase_conn')

router.post('/sign_up', async (req, res) => {
    try {
        const { UserName, Password, Role, Phone_Number } = req.body
        
        const salted_password = await bcrypt.hash(Password, 10)
        const role = Role || 'user';

        const { data, error } = await db.from("Login").insert([
            { 
                username: UserName, 
                saltedpassword: salted_password, 
                role: role, 
                phone_number: Phone_Number 
            }
        ]).select();

        if (error) {
            console.error("Signup database error:", error);
            return res.status(400).send(error.message || "Failed to sign up");
        }

        if (!data || data.length === 0) {
            console.warn("Signup succeeded but no rows were returned. Check RLS policies.");
        }

        res.send("User Successfully Signed Up!")
    } catch (err) {
        console.error("Signup server exception:", err);
        res.status(500).send("Internal Server Error");
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
            .single();

        // 2. Handle connection errors or missing users
        if (error) {
            if (error.code === 'PGRST116') {
                console.error("Login failed: User not found ->", UserName);
                return res.status(401).send("Invalid Username or Password");
            }
            console.error("Login database error:", error);
            return res.status(500).send("Database error occurred");
        }

        if (!user) {
            console.error("Login failed: No user object returned for ->", UserName);
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