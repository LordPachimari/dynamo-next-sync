import { JSONObject, JSONValue, WriteTransaction } from "replicache";
import { delItems, delPermItems, putItems, updateItems } from "./data";

const DELETE = "DELETE" as const;
const PUT = "PUT" as const;
const UPDATE = "UPDATE" as const;
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
  put({ key, value }: { key: string; value: JSONObject }): void;
  /**
   * Removes a `key` and its value from the database. Returns `true` if there was a
   * `key` to remove.
   */
  del({ key }: { key: string }): void;
  update({ key, value }: { key: string; value: JSONObject }): void;
}

export class ReplicacheTransaction implements CustomWriteTransaction {
  private readonly _spaceID: string;
  private readonly _version: number;
  private readonly _cache: Map<
    string,
    {
      method: typeof PUT | typeof DELETE | typeof UPDATE;
      value?: JSONObject;
    }
  > = new Map();
  private readonly _userId: string;

  constructor(spaceID: string, version: number, userId: string) {
    this._spaceID = spaceID;
    this._version = version;
    this._userId = userId;
  }

  put({ key, value }: { key: string; value: JSONObject }) {
    this._cache.set(key, { method: PUT, value });
  }
  update({ key, value }: { key: string; value: JSONObject }) {
    this._cache.set(key, { method: UPDATE, value });
  }
  del({ key }: { key: string }) {
    this._cache.set(key, { method: DELETE });
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
    if (items.length === 0) {
      return;
    }

    const itemsToPut: { key: string; value: JSONObject }[] = [];
    const itemsToUpdate: { key: string; value: JSONObject }[] = [];
    const keysToDelete: string[] = [];
    for (const item of items) {
      if (item[1].method === PUT && item[1].value) {
        itemsToPut.push({ key: item[0], value: item[1].value });
      } else if (item[1].method === DELETE && item[1].value) {
        keysToDelete.push(item[0]);
      } else if (item[1].method === UPDATE && item[1].value) {
        itemsToUpdate.push({ key: item[0], value: item[1].value });
      }
    }
    const keysToDel = items
      .filter(([, { method }]) => method === DELETE)
      .map(([key]) => key);

    await Promise.all([
      delItems({
        keysToDel,
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
      updateItems({
        items: itemsToUpdate,
        spaceId: this._spaceID,
        userId: this._userId,
        version: this._version,
      }),
    ]);
    this._cache.clear();
  }
}
