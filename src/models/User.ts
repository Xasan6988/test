import {model, Schema} from "mongoose";
import {Role, State} from "../types";
import {IUser} from "../types/User";

const userSchema = new Schema<IUser>({
    name: {type: String, required: true},
    birthday: {type: Date, required: true},
    email: {type: String, required: true, unique: true},
    password: String,
    role: {type: String, default: Role.USER, enum: Role},
    state: {type: Number, enum: State, default: State.ACTIVE},
});

export const User = model('User', userSchema);