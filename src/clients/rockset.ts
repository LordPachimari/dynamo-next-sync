
import rockset from "@rockset/client";
import { env } from "~/env.mjs";
const apikey = env.ROCKSET_API_KEY;
const apiserver = "https://api.use1a1.rockset.com";
export const rocksetClient = rockset(apikey, apiserver);