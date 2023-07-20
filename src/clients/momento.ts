import {
  CacheClient,
  Configurations,
  CredentialProvider,
  TopicClient,
  TopicConfigurations,
} from "@gomomento/sdk";
import { env } from "~/env.mjs";

export const momento = new CacheClient({
  configuration: Configurations.Laptop.v1(),
  credentialProvider: CredentialProvider.fromEnvironmentVariable({
    environmentVariableName: "MOMENTO_AUTH_TOKEN",
  }),
  defaultTtlSeconds: 24 * 60 * 60,
});
// export const momentoTopic = new TopicClient({
//   configuration: TopicConfigurations.Default.latest(),
//   credentialProvider: CredentialProvider.fromEnvironmentVariable({
//     environmentVariableName: env.MOMENTO_AUTH_TOKEN,
//   }),
// });
