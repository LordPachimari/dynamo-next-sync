import { MimeType, mimeTypes } from "./mime-types";
import * as z from "zod";
export const ALLOWED_FILE_TYPES = [
  "image",
  "video",
  "audio",
  "pdf",
  "text",
  "blob",
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

function zodEnumFromObjKeys<K extends string>(
  obj: Record<K, any>
): z.ZodEnum<[K, ...K[]]> {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
  return z.enum([firstKey!, ...otherKeys]);
}

export const MimeTypeZod = zodEnumFromObjKeys(mimeTypes);

export const InternalFileTypeValidator = z.enum(ALLOWED_FILE_TYPES);
export const InternalMimeTypeValidator = MimeTypeZod;

export const CombinedTypeValidator = z.union([
  InternalFileTypeValidator,
  InternalMimeTypeValidator,
]);

/** This matches the return type from the infra */
export interface FileData {
  id: string;
  createdAt: string;

  fileKey: string | null;
  fileName: string;
  metadata: string | null;

  callbackUrl: string;
  callbackSlug: string;
}

export type UploadedFile = {
  name: string;
  key: string;
  url: string;
  size: number;
};

type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;
export type SizeUnit = "B" | "KB" | "MB" | "GB";
export type FileSize = `${PowOf2}${SizeUnit}`;

type RouteConfig = {
  maxFileSize: FileSize;
  maxFileCount: number;
};

export type FileRouterInputKey = AllowedFileType | MimeType;

export type ExpandedRouteConfig = Partial<
  Record<FileRouterInputKey, RouteConfig>
>;

type PartialRouteConfig = Partial<
  Record<FileRouterInputKey, Partial<RouteConfig>>
>;

export type FileRouterInputConfig = FileRouterInputKey[] | PartialRouteConfig;
