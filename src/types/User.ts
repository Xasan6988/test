import {Role} from "./Role";
import {State} from "./State";

export interface IUser {
    name: string;
    birthday: Date;
    email: string;
    password: string;
    role: Role;
    state: State;
}