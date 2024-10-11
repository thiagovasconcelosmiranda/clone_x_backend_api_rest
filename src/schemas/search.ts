import { string, z } from "zod";

export const searchSchema = z.object({
  q: string({message: 'Preencha a busca'}).min(3),
  page: z.coerce.number().min(0).optional()
});