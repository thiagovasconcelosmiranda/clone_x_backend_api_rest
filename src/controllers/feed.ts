import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { feedSchema } from "../schemas/feed";
import { getUserFollowing } from "../services/user";
import { findTweetFeed, countTweetFeed } from "../services/tweet";

export const getFeed = async (req: ExtendedRequest, res: Response) => {
    const safeData = feedSchema.safeParse(req.query);
    if (!safeData.success) {
        res.json({ error: safeData.error.flatten().fieldErrors });
        return;
    }
   const countTweet = await countTweetFeed();
    let perPage = 2;
    let currentPage = safeData.data.page ?? 0;
   
    const following = await getUserFollowing(req.userSlug as string);
    const tweets = await findTweetFeed(following, currentPage, perPage);

    res.json({ tweets, page: currentPage, countTweet, perPage});
}