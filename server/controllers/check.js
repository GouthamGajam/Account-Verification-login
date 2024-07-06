import express from "express";
import CheckModel from '../models/check.js'
import config from "config";
const router = express.Router();
import nodemailer from "nodemailer";
import twilio from "twilio";
import bcrypt from "bcryptjs";


    let HOST = config.get("HOST");
    let PORT = config.get("PORT");
    let USER = config.get("USER");
    let PASS = config.get("PASS");

    let sendEmail = async(myEmails,text,subject,attachments,htmlContent)=>{
        try {
            let transporter = nodemailer.createTransport({
                host: HOST,
                port: PORT,
                secure: false,
                auth:{
                    user: USER,
                    pass: PASS,
                },
            });

            let info = transporter.sendMail({
                from:`Sending from terminal ${USER}`,
                to: myEmails,
                subject: subject,
                text:text,
                html: htmlContent,
                attachments: attachments
            });
            console.log("Email Sent");
        } catch (error) {
            console.log(error);
        }
    };


/// This is for number 

        let SID = config.get("SID");
        let AUTH = config.get("AUTH");
        let PHONE = config.get("PHONE");
        const client = twilio (SID , AUTH);

        let sensSMS =  async(toNumber, bodyText) =>{
            try {
                const msg = await client.messages.create({
                    body:bodyText,
                    to:toNumber,
                    from: PHONE
                });
                console.log(`Message sent with SID: ${msg.sid}`);
            } catch (error) {
                console.log("Error sending message:",error);
            }
        };
//get Students
router.get("/all", async (req, res) => {
    try {
        let data = await CheckModel.find({});
        console.log(data);
        res.status(200).json(data)
    } catch (error) {
        console.log(error);
    }
});

// register new member
router.post("/register", async(req,res) => {
    try {
        const {Name, Email, Phone, Password} = req.body;
        if(!Name ||!Email || !Phone || !Password ) {
            res.status(400);
            throw new Error("Enter All Fields");
        }
        

        const otp = Math.floor((Math.random() * 10000000));
        const text = `This email is send from Goutham \n Your 6 Digit pin :${otp} `;
        const subject = "6 digit pin to verify";
        sendEmail(Email,text,subject);

        let phoneotp = Math.floor((Math.random() * 10000000));
        // sensSMS(Phone,`To verify your number ->6 digit pin is ${phoneotp}`);

        // for hashing password
        let hashedPassword = await bcrypt.hash(Password, 10);

        const dataa = await CheckModel.create({Name, Email, Phone, Password:hashedPassword, otp, phoneotp,phoneverify:false ,mailverify:false });
        res.status(200).json({dataa});
    } catch (error) {
        console.log(error);
    }
});


// check email otp
router.post("/email/verify/:Email", async(req, res)=>{
    try {
        const user = await CheckModel.findOne({ Email: req.params.Email });
        const {otp} = req.body;
        if(!user){
            res.status(200).json({message:"Wrong mail"});
        }
        console.log(otp);
        console.log(user.otp);
        if(otp == user.otp){
            user.mailverify = true;
            await user.save();
            res.status(201).json({message:"Email verification done"});
        } else{
            res.status(401).json({message:"wrong otp"});
        }
    } catch (error) {
        console.log(error)
    }
});


// check phone otp - phoneotp 
router.post("/phone/verify/:Phone", async(req, res)=>{
    try {
        const user = await CheckModel.findOne({ Phone: req.params.Phone });
        const {phoneotp} = req.body;
        if(!user){
            res.status(200).json({message:"Wrong phone number"});
        }
        console.log(phoneotp);
        console.log(user.phoneotp);
        if(phoneotp == user.phoneotp){
            user.phoneverify = true;
            await user.save();
            res.status(201).json({message:"Phone verification done"});
        } else{
            res.status(401).json({message:"wrong otp"});
        }
    } catch (error) {
        console.log(error)
    }
});

router.get("/login", async(req,res)=>{
    try {
        const {Email, Password} = req.body;
        const user = await CheckModel.findOne({Email: Email});

        let match = await bcrypt.compare(Password,user.Password)
        if(user.phoneverify==false){
            res.status(402).json({message:"phone number is not verified"});
        }
        if(user.mailverify==false){
            res.status(402).json({message:"Mail is not verified"});
        }
        if(!match){
            res.status(402).json({message:"Password is different"});
        }
        if(user.phoneverify==true && user.mailverify==true && match) {
            res.status(202).json({message:"Login is successfull"});
        }else{
            res.status(401).json({message:"Something is wrong with input"});
        }
    } catch (error) {
        console.log(error)
    }
})


// get data via name 
router.get("/getbyname/:name", async (req, res) => {
    try {
        let given = req.params.name
        const Name = await CheckModel.find({ Name: given })
        if (!Name) {
            res.status(404);
            throw new Error("Username not found");
        }
        res.status(200).json(Name);
    } catch (err) {
        console.log(err);
    }
});


// get specific data via id -
router.get("/getbyid/:id", async (req, res) => {
    try {
        const st = await CheckModel.findById(req.params.id);
        if (!st) {
            res.status(404);
            throw new Error("not found");
        }
        res.status(200).json(st);
    } catch (err) {
        console.log(err);
    }
});


router.delete("/delete/:id", async (req, res) => {
    try {
        const stu = await CheckModel.findById(req.params.id);
        if (!stu) {
            res.status(404);
            throw new Error("Student not found");
        }
        await CheckModel.findByIdAndDelete({ _id: req.params.id });
        res.status(200).json({ message: "data successfully deleted" });
    } catch (err) {
        console.log(err);
    }
});

router.delete("/delall", async (req, res) => {
    try {
        await CheckModel.deleteMany();
        res.status(200).json({ message: "All data deleted successfully." });
    } catch (err) {
        console.log(err);
    }
});


export default router ;
