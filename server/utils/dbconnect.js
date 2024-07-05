import mongoose from "mongoose";
import config from "config";

let connectDB = async ()=>{
    try {
        let myurl = config.get("DBurl");
        console.log(myurl)
        await mongoose.connect(myurl)
        console.log(`DB connected successfully`)
    } catch (error) {
        console.log(error);
    }
}
connectDB()