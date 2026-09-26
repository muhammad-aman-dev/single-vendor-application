import express from "express";

const userRouter = express.Router();

userRouter.get("/check", async (req, res ) =>{
    console.log(process.env.CLIENT_URL);
    return res.send("process.env.CLIENT_URL");
})

export default userRouter;