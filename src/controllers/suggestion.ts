import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { getUserFollower, getUserSuggestions } from "../services/user";

export const getSuggestions = async (req:ExtendedRequest, res: Response) =>{
   const followers = await getUserFollower(req.userSlug as string);
   const suggestions = await getUserSuggestions(req.userSlug as string);

   res.json({users: suggestions, followers: followers});
} 