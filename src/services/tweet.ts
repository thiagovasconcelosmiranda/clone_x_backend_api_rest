import { prisma } from "../utils/prisma"
import { getPublicUrl } from "../utils/url";
import path from "path";
import fs, { mkdirSync } from 'fs';
import { url } from "inspector";

export const findTweet = async (id: number) => {
    const tweet = await prisma.tweet.findFirst({
        include: {
            user: {
                select: {
                    name: true,
                    avatar: true,
                    slug: true
                }
            },
            likes: {
                select: {
                    userSlug: true
                }
            },
            answers: {
                select: {
                    body: true,
                    image: true,
                    user: true,
                    id: true,
                    createAt: true
                }
            }
        },
        where: { id }
    });

    if (tweet) {
        tweet.user.avatar = getPublicUrl(tweet.user.avatar, 'avatars', tweet.user.slug);
        for (let answerIndex in tweet.answers) {
            tweet.answers[answerIndex].user.avatar = getPublicUrl(tweet.answers[answerIndex].user.avatar, 'avatars', tweet.answers[answerIndex].user.slug);
            if (tweet.answers[answerIndex].image) {
                tweet.answers[answerIndex].image = getPublicUrl(tweet.answers[answerIndex].image, 'amswers', tweet.answers[answerIndex].user.slug);
            }
        }
        return tweet;
    }
}

export const createTweet = async (slug: string, body: string, answer?: number, image?: any) => {
    const dirname = path.join(__dirname, '../../public/posts/');
    var nameImage = null;

    if (image !== null) {
        nameImage = image.name;
    }

    const newTweet = await prisma.tweet.create({
        data: {
            body,
            userSlug: slug,
            answerOf: answer ?? 0,
            image: nameImage
        }
    });

    if (image !== null) {
        if (!fs.existsSync(dirname + slug)) {
            mkdirSync(dirname + slug);
        }

        if (fs.existsSync(dirname + slug)) {
            mkdirSync(dirname + slug + '/' + newTweet.id);
        }

        image.mv(dirname + slug + '/' + newTweet.id + '/' + image.name);
    }

    return newTweet;
}

export const findAnswersTweet = async (id: number) => {
    const tweets = await prisma.tweet.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    avatar: true,
                    slug: true
                }
            },
            likes: {
                select: {
                    userSlug: true
                }
            }
        },
        where: { answerOf: id }
    });

    for (let tweetIndex in tweets) {
        tweets[tweetIndex].user.avatar = getPublicUrl(tweets[tweetIndex].user.avatar, 'avatars', tweets[tweetIndex].user.slug)

    }

    return tweets;
}

export const checkIfTweetIsByUser = async (slug: string, id: number) => {
    const isLiked = await prisma.tweetLike.findFirst({
        where: {
            userSlug: slug,
            tweetId: id
        }
    });

    return isLiked ? true : false;
}

export const unlikeTweet = async (slug: string, id: number) => {
    await prisma.tweetLike.deleteMany({
        where: {
            userSlug: slug,
            tweetId: id
        }
    })
}

export const likeTweet = async (slug: string, id: number) => {
    await prisma.tweetLike.create({
        data: {
            userSlug: slug,
            tweetId: id
        }
    });
}

export const findTweetsByUser = async (slug: string, currentPage: number, perPage: number) => {

    const countTweet = await prisma.tweet.count({
        where: {
            userSlug: slug
        }
    });

    const tweets = await prisma.tweet.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    avatar: true,
                    slug: true
                }
            },
            likes: {
                select: {
                    userSlug: true
                }
            },
            answers: {
                select: {
                    body: true,
                    image: true,
                    user: true,
                    tweetId: true,
                    answerLikes: true
                }
            }
        },
        where: { userSlug: slug, answerOf: 0 },
        orderBy: { createAt: 'desc' },
        skip: currentPage * perPage,
        take: perPage
    });

    for (let tweetIndex in tweets) {
        tweets[tweetIndex].user.avatar = getPublicUrl(tweets[tweetIndex].user.avatar, 'avatars', tweets[tweetIndex].user.slug);
        for (let answerIdex in tweets[tweetIndex].answers) {
            tweets[tweetIndex].answers[answerIdex].user.avatar = getPublicUrl(
                tweets[tweetIndex].answers[answerIdex].user.avatar,
                'avatars',
                tweets[tweetIndex].answers[answerIdex].user.slug);
        }
    }
    const tweet = [
        tweets,
        countTweet
    ]
    return tweet;
}

export const countTweetFeed = async (following: string[]) => {
    let count = 0;
    for (let followIndex in following) {
        const countTweet = await prisma.tweet.count({
            where: { userSlug: following[followIndex] }
        })
        count += countTweet
    }
    return count;
}

export const findTweetFeed = async (following: string[], currentPage: number, perPage: number) => {
    const tweets = await prisma.tweet.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    avatar: true,
                    slug: true
                }
            },
            likes: {
                select: {
                    userSlug: true
                }
            },
            answers: {
                select: {
                    id: true,
                    body: true,
                    image: true,
                    user: true,
                    answerLikes: true
                }
            }
        },

        where: {
            userSlug: { in: following },
            answerOf: 0
        },
        orderBy: { createAt: 'desc' },
        skip: currentPage * perPage,
        take: perPage
    });

    for (let tweetIndex in tweets) {
        tweets[tweetIndex].user.avatar = getPublicUrl(tweets[tweetIndex].user.avatar, 'avatars', tweets[tweetIndex].user.slug);

        for (let answerIndex in tweets[tweetIndex].answers) {
            tweets[tweetIndex].answers[answerIndex].user.avatar = getPublicUrl(tweets[tweetIndex].answers[answerIndex].user.avatar, 'avatars', tweets[tweetIndex].answers[answerIndex].user.slug);

            if (tweets[tweetIndex].answers[answerIndex].image) {
                tweets[tweetIndex].answers[answerIndex].image = getPublicUrl(tweets[tweetIndex].answers[answerIndex].image, '', tweets[tweetIndex].answers[answerIndex].user.slug);
            }
        }
    }

    return tweets;
}

export const findTweetsByBody = async (bodyContains: string, currentPage: number, perPage: number) => {
    const tweets = await prisma.tweet.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    avatar: true,
                    slug: true
                }
            },
            likes: {
                select: {
                    userSlug: true
                }
            }
        },
        where: {

            body: {
                contains: bodyContains,
                mode: 'insensitive'
            },
            answerOf: 0
        },
        orderBy: { createAt: 'desc' },
        skip: currentPage * perPage,
        take: perPage
    });

    for (let tweetIndex in tweets) {
        tweets[tweetIndex].user.avatar = getPublicUrl(tweets[tweetIndex].user.avatar, 'avatars', tweets[tweetIndex].user.slug);
    }
    return tweets;
}

export const createAnswers = async (body: string, image: any, userSlug: string, tweetId: number) => {
    const dirname = path.join(__dirname, '../../public/answers/');
    let nameImage = null;
    if (image) {
        nameImage = image.name;
    }

    const answer = await prisma.answer.create({
        data: {
            body,
            image: nameImage,
            userSlug,
            tweetId
        }
    });

    if (image !== null) {
        if (!fs.existsSync(dirname + userSlug)) {
            mkdirSync(dirname + userSlug);
        }

        if (fs.existsSync(dirname + userSlug)) {
            mkdirSync(dirname + userSlug + '/' + answer.id);
        }
        image.mv(dirname + userSlug + '/' + answer.id + '/' + image.name);
    }

    return answer;
}

export const checkIfAnswerIsByUser = async (slug: string, id: number) => {
    const isLiked = await prisma.answerLike.findFirst({
        where: {
            userSlug: slug,
            answerId: id
        }
    });
    return isLiked ? true : false;
}

export const unlikeAnswer = async (slug: string, id: number) => {
    await prisma.answerLike.deleteMany({
        where: {
            userSlug: slug,
            answerId: id
        }
    });
}

export const likeAnswer = async (slug: string, id: number) => {
    await prisma.answerLike.create({
        data: {
            userSlug: slug,
            answerId: id
        }
    });
}

