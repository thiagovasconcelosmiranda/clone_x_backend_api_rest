import {z} from 'zod';

export const userCoverSchema = z.object({
 slug: z.string().min(2, 'digite o slug').optional(),
});