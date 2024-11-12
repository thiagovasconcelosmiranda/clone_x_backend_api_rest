import { Router } from "express";
import  express from "express";
import path from "path";

import * as pingController from "../controllers/ping";
import * as authController from "../controllers/auth";
import * as tweetController from '../controllers/tweet';
import * as userController from '../controllers/user';
import * as feedController from '../controllers/feed';
import * as searchController from '../controllers/search';
import * as trendController from '../controllers/trend';
import * as suggestionController from '../controllers/suggestion';

import { verifyJwt } from "../utils/jwt";

export const mainRouter = Router();

mainRouter.get('/ping', pingController.ping);
mainRouter.get('/privateping', verifyJwt, pingController.privatePing);

mainRouter.post('/auth/signup', authController.signUp);
mainRouter.post('/auth/signin', authController.signin);

mainRouter.post('/tweet', verifyJwt,tweetController.addTweet);
mainRouter.get('/tweet/:id', verifyJwt, tweetController.getTweet);
mainRouter.get('/tweet/:id/:answers', verifyJwt, tweetController.getAnswers);
mainRouter.post('/tweet/:id/like', verifyJwt, tweetController.likeToggle);

mainRouter.get('/user/:slug', verifyJwt, userController.getUser);
mainRouter.get('/user/:slug/tweets', verifyJwt, userController.getUserTweet);
mainRouter.post('/user/:slug/follow', verifyJwt, userController.followToggle);

mainRouter.put('/user', verifyJwt, userController.updateUser);
mainRouter.put('/user/avatar', verifyJwt, userController.updateAvatar);
mainRouter.put('/user/cover', verifyJwt, userController.updateCover);

mainRouter.get('/feed', verifyJwt, feedController.getFeed);
mainRouter.get('/search', verifyJwt, searchController.searchTweets);
mainRouter.get('/trending', verifyJwt, trendController.getTrend);
mainRouter.get('/suggestions', verifyJwt, suggestionController.getSuggestions);

