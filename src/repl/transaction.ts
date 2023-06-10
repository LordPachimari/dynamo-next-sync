import { JSONObject, JSONValue, WriteTransaction } from "replicache";

import { delItems, delPermItems, putItems } from "./data";

const DELETE_PERMANENTLY = "DELETE_PERMANENTLY" as const;
const DELETE = "DELETE" as const;
const PUT = "PUT" as const;

declare type ReadonlyJSONValue =
  | null
  | string
  | boolean
  | number
  | ReadonlyArray<ReadonlyJSONValue>
  | ReadonlyJSONObject;
declare type ReadonlyJSONObject = {
  readonly [key: string]: ReadonlyJSONValue;
};
interface CustomWriteTransaction {
  put({ key, value }: { key: string; value: ReadonlyJSONValue }): void;
  /**
   * Removes a `key` and its value from the database. Returns `true` if there was a
   * `key` to remove.
   */
  del({ key }: { key: string }): void;
  delPerm({ key }: { key: string }): void;
}

export class ReplicacheTransaction implements CustomWriteTransaction {
  private readonly _spaceID: string;
  private readonly _clientID: string;
  private readonly _version: number;
  private readonly _cache: Map<
    string,
    {
      method: typeof PUT | typeof DELETE | typeof DELETE_PERMANENTLY;
      value?: JSONObject;
    }
  > = new Map();
  private readonly _userId: string;

  constructor(
    spaceID: string,
    clientID: string,
    version: number,
    userId: string,
  ) {
    this._spaceID = spaceID;
    this._clientID = clientID;
    this._version = version;
    this._userId = userId;
  }

  get clientID(): string {
    return this._clientID;
  }

  put({ key, value }: { key: string; value: JSONObject }) {
    this._cache.set(key, { method: PUT, value });
  }
  del({ key }: { key: string }) {
    this._cache.set(key, { method: DELETE });
  }
  delPerm({ key }: { key: string }) {
    this._cache.set(key, { method: DELETE_PERMANENTLY });
  }

  // TODO!
  //   async isEmpty(): Promise<boolean> {
  //     throw new Error("Method isEmpty not implemented");
  //   }
  //   scan(): ScanResult<string>;
  //   scan<Options extends ScanOptions>(
  //     _options?: Options,
  //   ): ScanResult<KeyTypeForScanOptions<Options>> {
  //     throw new Error("Method scan not implemented.");
  //   }

  async flush(): Promise<void> {
    const items = [...this._cache.entries()].map((item) => item);
    // if (items.length === 0) {
    //   throw new Error("nothing");
    // }

    const itemsToPut: { key: string; value: JSONObject }[] = [];
    for (const item of items) {
      if (
        item[1].method !== DELETE &&
        item[1].method !== DELETE_PERMANENTLY &&
        item[1].value
      ) {
        itemsToPut.push({ key: item[0], value: item[1].value });
      }
    }
    const keysToDel = items
      .filter(([, { method }]) => method === DELETE)
      .map(([key]) => key);
    const keysToDelPerm = items
      .filter(([, { method }]) => method === DELETE_PERMANENTLY)
      .map(([key]) => key);
    await Promise.all([
      delItems({
        keysToDel,
        spaceId: this._spaceID,
        userId: this._userId,
        version: this._version,
      }),
      delPermItems({
        keysToDel: keysToDelPerm,
        spaceId: this._spaceID,
        userId: this._userId,
        version: this._version,
      }),
      putItems({
        items: itemsToPut,
        spaceId: this._spaceID,
        userId: this._userId,
        version: this._version,
      }),
    ]);
    this._cache.clear();
  }
}
