import { RequestHandler } from "express";
import { signUpSchema } from "../schemas/signup";
import { createUser, findUserByEmail } from "../services/user";
import { findUserBySlug } from "../services/user";
import slug from "slug";
import { compare, hashSync } from "bcrypt";
import { number, string } from "zod";
import { strict } from "assert";
import { createJwt } from "../utils/jwt";
import { signInSchema } from "../schemas/signin";

export const signUp: RequestHandler = async (req, res) => {
    const safeData = signUpSchema.safeParse(req.body);
    if (!safeData.success) {
        res.json({ error: safeData.error.flatten().fieldErrors });
        return;
    }

    const hasEmail = await findUserByEmail(safeData.data.email);
    if (hasEmail) {
        res.json({ error: 'E-mail já existe' });
        return;
    }

    let genSlug = true;

    let userSlug = slug(safeData.data.name);
    while (genSlug) {
        const hasSlug = await findUserBySlug(userSlug);
        if (hasSlug) {
            let slugSuffix = Math.floor(Math.random() * 99999).toString();
            userSlug = slug(safeData.data.name + slugSuffix);
        } else {
            genSlug = false;
        }
    }

    // Gerar hash de senha
    //const hasPassword = await hashSync(safeData.data.password, 10);
    const hasPassword = 'teste';


    //cria o usuario

    const newUser = await createUser({
        slug: userSlug,
        name: safeData.data.name,
        email: safeData.data.email,
        password: hasPassword
    });

    //cria token
    const token = createJwt(userSlug);

    //Retorno o resultado (token, user)
    res.status(201).json({
        token,
        user: {
            name: newUser.name,
            slug: newUser.slug,
            avatar: newUser.avatar
        }
    });
}

export const signin: RequestHandler = async (req, res) => {
    const safeData = signInSchema.safeParse(req.body);
    if (!safeData.success) {
        res.json({ error: safeData.error.flatten().fieldErrors });
        return;
    }

    const user = await findUserByEmail(safeData.data.email);
    if (!user) return res.status(401).json({ error: 'Acesso negado' });

    const verifyPass = await compare(safeData.data.password, user.password);
    if (!verifyPass) return res.status(401).json({ error: 'Acesso negado' });

    const token = createJwt(user.slug);

    res.json({
        token,
        user: {
            name: user.name,
            slug: user.slug,
            avatar: user.avatar
        }
    });
}
