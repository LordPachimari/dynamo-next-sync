import { z } from "zod";

// From https://github.com/colinhacks/zod#json-type
type Literal = boolean | null | number | string | Uint8Array;
type Json = Literal | { [key: string]: Json } | Json[];
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema),
    z.record(jsonSchema),
    z.instanceof(Uint8Array),
  ]),
);
export type JSONType = z.infer<typeof jsonSchema>;
