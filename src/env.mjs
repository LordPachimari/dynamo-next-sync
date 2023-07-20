import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: {
    CLERK_SECRET_KEY: z.string(),
    MAIN_TABLE_NAME: z.string(),
    CVR_INDEX_NAME: z.string(),
    PUBLISHED_QUESTS_CVR_INDEX_NAME: z.string(),
    EPHEMERAL_TABLE_NAME: z.string(),
    REGION: z.string(),
    DYNAMO_ACCESS_KEY: z.string(),
    DYNAMO_SECRET_KEY: z.string(),
    UPLOADTHING_SECRET: z.string(),
    PUSHER_APP_ID: z.string(),
    PUSHER_SECRET: z.string(),
    ROCKSET_API_KEY: z.string(),
    UPSTASH_REDIS_URL:z.string(),
    UPSTASH_REDIS_TOKEN:z.string(),
       MOMENTO_AUTH_TOKEN: z.string(),
    NEXT_PUBLIC_MOMENTO_CACHE_NAME: z.string(),
    USERNAME_INDEX:z.string()
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_REPLICACHE_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_CLUSTER: z.string(),
    NEXT_PUBLIC_YJS_PARTYKIT_URL:z.string()
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    REGION: process.env.REGION,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_REPLICACHE_KEY: process.env.NEXT_PUBLIC_REPLICACHE_KEY,
    MAIN_TABLE_NAME: process.env.MAIN_TABLE_NAME,
    CVR_INDEX_NAME: process.env.CVR_INDEX_NAME,
    PUBLISHED_QUESTS_CVR_INDEX_NAME:
      process.env.PUBLISHED_QUESTS_CVR_INDEX_NAME,
    EPHEMERAL_TABLE_NAME: process.env.EPHEMERAL_TABLE_NAME,
    DYNAMO_ACCESS_KEY: process.env.DYNAMO_ACCESS_KEY,
    DYNAMO_SECRET_KEY: process.env.DYNAMO_SECRET_KEY,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID,
    PUSHER_SECRET: process.env.PUSHER_SECRET,
    ROCKSET_API_KEY: process.env.ROCKSET_API_KEY,
    UPSTASH_REDIS_TOKEN:process.env.UPSTASH_REDIS_TOKEN,
    UPSTASH_REDIS_URL:process.env.UPSTASH_REDIS_URL,
     MOMENTO_AUTH_TOKEN: process.env.MOMENTO_AUTH_TOKEN,
    NEXT_PUBLIC_MOMENTO_CACHE_NAME: process.env.NEXT_PUBLIC_MOMENTO_CACHE_NAME,
    USERNAME_INDEX:process.env.USERNAME_INDEX,
    NEXT_PUBLIC_YJS_PARTYKIT_URL:process.env.NEXT_PUBLIC_YJS_PARTYKIT_URL
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
