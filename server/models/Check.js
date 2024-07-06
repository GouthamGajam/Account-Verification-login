import mongoose from "mongoose";

const CheckSchema = new mongoose.Schema(
    {
        Name: {
            type: String,
            required: [true, "Please enter your name"],
        },
        Email: {
            type: String,
            required: [true, "Please enter your email"],
        },
        Phone: {
            type: String,
            required: [true, "Please enter your Phone number"],
        },
        Password: {
            type: String,
            required: [true, "Please enter your Password"],
        },
        otp: {
            type: String
        },
        phoneotp: {
            type: String
        },
        phoneverify:{
            type:Boolean
        },
        mailverify:{
            type:Boolean
        }
    }
);

const CheckModel = mongoose.model("check", CheckSchema);
export default CheckModel;
