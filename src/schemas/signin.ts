import {z} from 'zod';

export const signInSchema = z.object({
  email: z.string({message: 'E-mail é obrigatório'}).email('E-mail invalido'),
  password: z.string({message: 'Senha é obrigatório'}).min(4, 'Precisa ter 4 ou mais caracteres')
});