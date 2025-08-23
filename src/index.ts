import express from "express";
import cors from "cors";
import log4js, {Level} from "log4js";
import dotenv from "dotenv";
import mongo from "mongoose";
import {User} from "./models/User";
import {Role} from "./types";

dotenv.config({path: "./.development.env"});

const port = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

const logger = log4js.getLogger("app");
logger.level = process.env.LOG_LEVEL as string | Level || 'info';


const app = express();

app.use(express.json(), cors());


(async () => {
    try {
        logger.info(`Server is connection to mongo...`);

        if (!MONGO_URL)
            throw new Error("MONGO_URL is not defined");

        await mongo.connect(MONGO_URL);
        logger.info(`Connected to mongo...`);

        app.listen(port, async () => {
            const user = new User({name: "Ivan", password: "1234", role: Role.USER, });
            await user.save()
            logger.info(`Server started on port ${port}`);
        });
    } catch (e) {
        logger.error(e);
    }
})()