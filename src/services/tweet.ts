import slug from "slug";
import { prisma } from "../utils/prisma"
import { getPublicUrl } from "../utils/url";
import path from "path";
import fs, { mkdirSync } from 'fs';


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
            }
        },
        where: { id }
    });

    if (tweet) {
        tweet.user.avatar = getPublicUrl(tweet.user.avatar, 'avatars', tweet.user.slug);
        return tweet;
    }
}

export const createTweet = async (slug: string, body: string, answer?: number, image?: any ) => {
    const dirname = path.join(__dirname, '../../public/posts/');
    var nameImage = null;
    
    if(image !== null){
       nameImage = image.name;
    }

    
    const newTweet = await prisma.tweet.create({
        data: {
            body,
            userStlug: slug,
            answerOf: answer ?? 0,
            image: nameImage
        }
    });
    
    if(image !== null){
       if (!fs.existsSync(dirname + slug)) {
         mkdirSync(dirname + slug);
       }

       if(fs.existsSync(dirname + slug)){
          mkdirSync(dirname + slug + '/'+ newTweet.id);
       }
   
       image.mv(dirname + slug + '/'+ newTweet.id +'/' + image.name);
    }
    
    return  newTweet;
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
        where: { userStlug: slug, answerOf: 0 },
        orderBy: { createAt: 'desc' },
        skip: currentPage * perPage,
        take: perPage
    });

    return tweets;
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
            }
        },
        where: {
            userStlug: { in: following },
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