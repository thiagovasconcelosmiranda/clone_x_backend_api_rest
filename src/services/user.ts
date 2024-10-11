import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { getPublicUrl } from '../utils/url';
import { ping } from '../controllers/ping';

export const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (user) {
    return {
      ...user,
      avatar: getPublicUrl(user.avatar),
      cover: getPublicUrl(user.cover)
    }
  }

  return null;
}

export const findUserBySlug = async (slug: string) => {
  const user = await prisma.user.findFirst({
    select: {
      avatar: true,
      cover: true,
      slug: true,
      name: true,
      bio: true,
      link: true
    },
    where: { slug }
  });
  if (user) {
    return {
      ...user,
      avatar: getPublicUrl(user.avatar),
      cover: getPublicUrl(user.cover)
    }
  }

  return null;
}


export const createUser = async (data: Prisma.UserCreateInput) => {
  const newUser = await prisma.user.create({ data });

  return {
    ...newUser,
    avatar: getPublicUrl(newUser.avatar),
    cover: getPublicUrl(newUser.cover)
  }
}

export const getUserFollowingCount = async (slug: string) => {
  const count = await prisma.follow.count({
    where: { userSlug: slug }
  });

  return count;
}

export const getUserFollowersCount = async (slug: string) => {

  const count = await prisma.follow.count({
    where: { user2Slug: slug }
  });

  return count;
}

export const getUserTweetCount = async (slug: string) => {
  const count = await prisma.tweet.count({
    where: { userStlug: slug }
  });

  return count;
}


export const checkIfFollows = async (userSlug: string, user2Slug: string) => {
  const follows = await prisma.follow.findFirst({
    where: { userSlug, user2Slug }
  });
  return follows ? true : false;
}

export const follow = async (userSlug: string, user2Slug: string) => {
  await prisma.follow.create({
    data: { userSlug, user2Slug }
  });
}

export const unfollow = async (userSlug: string, user2Slug: string) => {
  await prisma.follow.deleteMany({
    where: { userSlug, user2Slug }
  });
}

export const UpdateUserInfo = async (slug: string, data: Prisma.UserUpdateInput) => {
  await prisma.user.update({
    where: { slug },
    data
  });
}

export const getUserFollowing = async (slug: string) => {
  const following = [];
  const reqFollow = await prisma.follow.findMany({
    select: { user2Slug: true },
    where: { userSlug: slug }
  });

  for (let reqItem of reqFollow) {
    following.push(reqItem.user2Slug);
  }

  return following;
}

export const getUserSuggestions = async (slug: string) => {
  const following = await getUserFollowing(slug);

  const followingPlusMe = await [...following, slug];

  type Suggestion = Pick<Prisma.UserGetPayload<Prisma.UserDefaultArgs>,
  "name" | "avatar" | "slug"
  >;
  
  const suggestions: Suggestion[] = await prisma.$queryRaw`
   SELECT
    name, avatar, slug
    FROM "User"
    WHERE slug NOT IN (${followingPlusMe.join(',')})
    ORDER BY  RANDOM()
    LIMIT 2;
   `;

   for(let sugIndex in suggestions){
    suggestions[sugIndex].avatar = getPublicUrl(suggestions[sugIndex].avatar);
   }
   return suggestions;
}