
import {z} from 'zod';

export const stringInSchema = z.object({
    identifier : z.string() ,
    password : z.string()
        .min(6, {message: 'Password must be at least 6 characters long'})
        .max(50, {message: 'Password must be at most 50 characters long'})
        .trim()
}).strict();