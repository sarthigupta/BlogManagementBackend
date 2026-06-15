import {Context} from 'hono';
export type AuthContext = Context & {
    userId: string;
    role: string;
};