import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { addTweetSchema } from "../schemas/add-tweet";
import { AddAnswerSchema } from '../schemas/add-answer';
import { checkIfTweetIsByUser, createTweet, findAnswersTweet, findTweet, likeTweet, unlikeTweet, createAnswers, countTweetFeed, checkIfAnswerIsByUser, likeAnswer, unlikeAnswer } from "../services/tweet";
import { addHashtag } from "../services/trend";
import { json } from "stream/consumers";

export const addTweet = async (req: ExtendedRequest, res: Response) => {
    const safeData = addTweetSchema.safeParse(req.body);
    var file = null;
    if (!safeData.success) {
        res.json({ error: safeData.error.flatten().fieldErrors });
        return;
    }

    if (req.files) {
        file = req.files.image
    }

    if (safeData.data.answer) {
        const hasAnswerTweet = findTweet(parseInt(safeData.data.answer));
        if (!hasAnswerTweet) {
            return res.json({ error: 'Tweet original inexistente' });
        }
    }

    const newTweet = await createTweet(
        req.userSlug as string,
        safeData.data.body,
        safeData.data.answer ? parseInt(safeData.data.answer) : 0,
        file
    );

    const hashtags = safeData.data.body.match(/#[a-zA-Z0-r9_]+/g);
    if (hashtags) {
        for (let hashtag of hashtags) {
            if (hashtag.length >= 2) {
                await addHashtag(hashtag);
            }
        }
    }
    res.json(newTweet);
}

export const getTweet = async (req: ExtendedRequest, res: Response) => {
    const { id } = req.params;
    const tweet = await findTweet(parseInt(id));
    if (!tweet) return res.json({ error: 'Tweet inexistente' });

    return res.json({ tweet: tweet });
}

export const getAnswers = async (req: ExtendedRequest, res: Response) => {
    const { id } = req.params;
    const answers = await findAnswersTweet(parseInt(id));
    res.json({ answers: answers });
}

export const likeToggle = async (req: ExtendedRequest, res: Response) => {
    const { id } = req.params;

    const liked = await checkIfTweetIsByUser(
        req.userSlug as string,
        parseInt(id)
    )
    let like: boolean = false;

    if (liked) {
        unlikeTweet(
            req.userSlug as string,
            parseInt(id)
        );
        like = false;

    } else {
        likeTweet(
            req.userSlug as string,
            parseInt(id)
        );
        like = true;
    }
    res.json({ like: like });
}

export const addAnswers = async (req: ExtendedRequest, res: Response) => {
    const { id } = req.params;
    const safeData = AddAnswerSchema.safeParse(req.body);

    if (!safeData.success) {
        res.json({ error: safeData.error.flatten().fieldErrors });
        return;
    }
    let file = null;

    if (req.files) {
        file = req.files.image;
    }
    const answer = await createAnswers(
        req.body.body,
        file,
        req.userSlug as string,
        parseInt(id)
    )

    res.json(answer);
}

export const answerLikeToggle = async (req: ExtendedRequest, res: Response) => {
    const { id } = req.params;
   
    const liked = await checkIfAnswerIsByUser(
        req.userSlug as string,
        parseInt(id)
    )
    let like: boolean = false;

    if(liked){
        unlikeAnswer(
            req.userSlug as string,
            parseInt(id)
        );
        like = false;
     
    }else{
        await likeAnswer(
            req.userSlug as string,
            parseInt(id));
        like = true;
    }
    res.json({like: like}) 
}