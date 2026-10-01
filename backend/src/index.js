// require('dotenv').config({path:'./.env'});
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({path:"./.env"});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB failed!!", err);
})




// first approach(worse)
//(async()=>{
//     try{ 
//         await mongoose.connect(`${process.env.MONGODB_URI}/{DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR:",error);
//             throw error;
//         })
//     }catch(error){
    
//         console.error("ERROR:",error)
//         throw err;
//        }
// })()