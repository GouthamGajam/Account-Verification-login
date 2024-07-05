import express from "express";
      import config from "config";
      import ("./utils/dbconnect.js");
      //import router from "./controllers/studentsc.js";

      const app = express();
      const PORT = config.get("port");
      app.use(express.json());

      app.get("/", (req,res)=>{
          try {
              res.status(200).json({message:"Hello connected"});
          } catch (error) {
              console.log(error);
              res.status(500).json({message:"not connected"});
          }
      });
      //app.use("/schools", router); 

      app.use((req, res, next) => {
          res.status(404).json({ message: "Wrong path" });
      });

      app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });