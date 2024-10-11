import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { getTrending } from "../services/trend";

export const getTrend = async (req: ExtendedRequest, res: Response) => {
   const trends = await getTrending();

   res.json({trends});
}