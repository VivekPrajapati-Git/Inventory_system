const conn = require('../config/cloud_conn')
const express = require('express');
const router = express.Router();
const multer = require('multer')

const upload = multer();

router.post('/upload_image',upload.single('avatar'),async(req,res)=>{
    try {
        const file = req.file;

        if (!file){
            return res.status(400).send("File Not Uploaded! ")
        }

        const result = await new Promise((resolve,reject)=>{
            const stream = conn.uploader.upload_stream(
                {resource_type : "image"},
                (error,result)=>{
                    if (error) reject(error);
                    else resolve(result)
                }
            )

            stream.end(file.buffer)
        });

        res.json({
            message : "File Uploaded Successfully!",
            url : result.secure_url
        })
    }
    catch(err){
        console.error(err);
        res.status(500).send("Upload Failed!")
    }
})

module.exports = router;