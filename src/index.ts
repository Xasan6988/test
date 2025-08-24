import express from "express";
import cors from "cors";
import logger from "./utils/Logger";
import dotenv from "dotenv";
import mongo from "mongoose";
import {userRouter} from "./routes/user.route";

dotenv.config({path: "./.development.env"});

const port = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;


const app = express();

app.use(express.json(), cors());

app.use('/', userRouter);


(async () => {
    try {
        logger.info(`Server is connection to mongo...`);

        if (!MONGO_URL)
            throw new Error("MONGO_URL is not defined");

        await mongo.connect(MONGO_URL);
        logger.info(`Connected to mongo...`);

        app.listen(port, async () => {
            logger.info(`Server started on port ${port}`);
        });
    } catch (e) {
        logger.error(e);
    }
})()