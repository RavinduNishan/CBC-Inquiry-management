import express from "express";
import { PORT, MONGODBURL } from "./config.js";
import mongoose from "mongoose";

import {Inquiry} from "./models/inquirymodel.js" ;
const app = express();

app.get("/", (req, res) => {
 console.log(req);
 return res.status(200).send
});

// app.post("/inquiry", (req, res) => {
//     try{
//         if(
//             !req.body.name ||
//             !req.body.email ||
//             !req.body.phone ||
//             !req.body.company ||
//             !req.body.category ||
//             !req.body.subject ||
//             !req.body.attachments ||
//             !req.body.message||
//             !req.body.status||
//             !req.body.comments ||
//             !req.body.priority ||
//             !req.body.assigned
//         ){
//             return res.status(400).send({message: "All fields are required."});  
//         }
//     }catch(error){
//         console.log(error.message);
//         response.status(500).send({message: error.message})
//     }    
// });

app.listen(PORT,()=>
    console.log(`Server is running on port ${PORT}`)
); 

mongoose
.connect(MONGODBURL)
  .then(() => console.log("MongoDB Connected..."))
  .app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
  })
  .catch((err) => {console.log(err)
} );
