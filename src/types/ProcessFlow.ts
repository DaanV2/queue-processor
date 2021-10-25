/**An intermediate interface to make promises handle easier*/
export interface ProcessFlow<T> {
  /**Resolves the promise(s)
   * @param item The item to pass along*/
  resolve(item: T): void;

  /**Rejects the promise(s)
   * @param item The item to pass along*/
  reject(reason: any): void;
}

