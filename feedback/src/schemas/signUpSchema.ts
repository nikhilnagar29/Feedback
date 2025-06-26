import {z} from 'zod';

export const usernameValidation = z
  .string()
  .min(3, {message: 'Username must be at least 3 characters long'})
  .max(20, {message: 'Username must be at most 20 characters long'})
  .trim()
  .toLowerCase();


export const signUpSchema = z.object({
  username: usernameValidation,
  email: z
    .string()
    .email({message: 'Please fill a valid email address'})
    .toLowerCase(),
  password: z 
    .string()
    .min(6, {message: 'Password must be at least 6 characters long'})
    .max(50, {message: 'Password must be at most 50 characters long'})
}) ;