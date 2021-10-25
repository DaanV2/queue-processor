
export namespace PromiseUtility {
  /**Converts the promise to a void promise
   * @param promise 
   * @returns 
   */
  export function ToVoid<T>(promise: Promise<T>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      promise.then(items => resolve());
      promise.catch(err => reject(err));
    })
  }
}