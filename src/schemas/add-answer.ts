import { z } from "zod";

export const AddAnswerSchema = z.object({
    body: z.string({ message: 'Precisa enviar um corpo' }),
})