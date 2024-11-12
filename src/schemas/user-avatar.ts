import {z} from 'zod';

export const userAvatarSchema = z.object({
 slug: z.string().min(2, 'digite o slug').optional(),
});