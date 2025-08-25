import jwt from "jsonwebtoken";
import {Middleware} from "express-validator/lib/base";
import logger from "../utils/Logger";

export const authMiddleware: Middleware = (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    try {
        const token = req?.headers?.authorization?.split(' ')?.[1];

        if (!token) return res.status(401).json({message: 'Unauthorized'});

        req.user = jwt.verify(token, process.env.JWT_SECRET ?? '');
        next();

    } catch (e: Error | any) {
        res.status(401).json({message: 'Unauthorized'});
        logger.error('Unauthorized: ' + e.message);
    }
}