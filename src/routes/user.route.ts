import {Router} from "express";
import {body, validationResult} from "express-validator";
import logger from "../utils/Logger";
import {User} from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {authMiddleware} from "../middlewares/auth.middleware";
import {IUser} from "../types/User";
import {Role, State} from "../types";

const router = Router();

router.post(
    '/sign-up',
    body('email').notEmpty().isEmail().trim(),
    body('password').notEmpty(), body('name').notEmpty().isString().trim(),
    body('birthday').notEmpty(),
    async (req, res) => {

        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({
                    errors: result.array(),
                });
            }

            const {email, password, name, birthday, role, state} = req.body;

            const existingUser = await User.findOne({email});

            if (existingUser) throw new Error("User already exists");

            const passwordHash = await bcrypt.hash(password, 10);

            const user = await new User({email, password: passwordHash, name, birthday, role, state});

            if (!user) throw new Error("User is not created");

            await user.save();

            const token = jwt.sign(
                {
                    email: user.email,
                    role: user.role,
                    id: user._id
                },
                process.env.JWT_SECRET ?? '',
                {expiresIn: '3h'}
            );

            res.status(201).json({
                message: "User is created",
                data: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    state: user.state,
                    birthday: user.birthday,
                    token
                },
            });

        } catch (e: Error | any) {
            logger.error(e);
            res.status(500).json({
                message: e.message,
            });
        }

    });

router.post(
    '/sign-in',
    body('email').notEmpty().isEmail().trim(),
    body('password').notEmpty(),
    async (req, res) => {

        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({
                    errors: result.array(),
                });
            }

            const {email, password} = req.body;

            const user = await User.findOne({email});

            if (!user) throw new Error("User not found");

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) throw new Error("Password is not valid");

            const token = jwt.sign(
                {
                    email: user.email,
                    role: user.role,
                    id: user._id
                },
                process.env.JWT_SECRET ?? '',
                {expiresIn: '3h'}
            );

            res.status(200).json({
                message: "User is signed in",
                data: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    state: user.state,
                    birthday: user.birthday,
                    token
                },
            });

        } catch (e: Error | any) {
            logger.error(e);
            res.status(500).json({
                message: e.message,
            });
        }

    });

// get user by id
router.get('/users:id', authMiddleware, async (req, res) => {
    try {
        const id = req?.params?.id;
        const {role, id: tokenUserId} = (req as unknown as Request & { user: IUser })?.user;

        if (role !== 'admin' && id !== tokenUserId) {
            return res.status(403).json({
                message: 'You are not allowed to get this user'
            });
        }

        const user = await User.findById(id);

        if (!user) throw new Error("User not found");

        res.status(200).json({
            message: "User is found",
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                state: user.state,
                birthday: user.birthday,
                id: user._id
            },
        });
    } catch (e: Error | any) {
        logger.error(e);
        res.status(500).json({
            message: e.message,
        });
    }
})

// get all users
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const {role} = (req as unknown as Request & { user: IUser })?.user;

        if (role !== Role.ADMIN) {
            return res.status(403).json({
                message: 'You are not allowed to get all users'
            });
        }

        const users = await User.find();

        res.status(200).json({
            message: "Users are found",
            data: users,
        });
    } catch (e: Error | any) {
        logger.error(e);
        res.status(500).json({
            message: e.message,
        });
    }
})

// ban user by admin or self ban
router.put('/users:id/ban', authMiddleware, async (req, res) => {
    try {
        const id = req?.params?.id;
        const {role, id: tokenUserId} = (req as unknown as Request & { user: IUser })?.user;

        if (role !== Role.ADMIN && id !== tokenUserId) {
            return res.status(403).json({
                message: 'You are not allowed to ban this user'
            });
        }

        const user = await User.findById(id);

        if (!user) throw new Error("User not found");

        user.state = State.BLOCKED;

        await user.save();

        res.status(200).json({
            message: "User is banned",
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                state: user.state,
                birthday: user.birthday,
                id: user._id
            },
        });
    } catch (e: Error | any) {
        logger.error(e);
        res.status(500).json({
            message: e.message,
        });
    }
})

export const userRouter = router;