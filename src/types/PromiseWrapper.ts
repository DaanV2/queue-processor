import { ProcessFlow } from './ProcessFlow';

/**A class that wraps around promise but provides easy access to resolve / reject it*/
export class PromiseWrapper<T> implements ProcessFlow<T>, Promise<T> {
  /**The promise to wrap around */
  private _promise: Promise<T>;
  /**The resolve callbackfn to resolve the promise*/
  private _resolve?: (value: T | PromiseLike<T>) => void;
  /**The reject callbackfn  to reject the promise*/
  private _reject?: (reason?: any) => void;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    })
  }

  /**resolves the promise */
  resolve(item: T): void {
    if (this._resolve) this._resolve(item);
  }

  /**rejects the promise */
  reject(reason?: any): void {
    if (this._reject) this._reject(reason);
  }

  /**Provides a then on the internal promise */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    return this._promise.then<TResult1, TResult2>(onfulfilled, onrejected);
  }

  /**Provides a catch on the internal promise */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult> {
    return this._promise.catch<TResult>(onrejected);
  }

  /**Provides a final call on the internal promise */
  finally(onfinally?: (() => void) | null): Promise<T> {
    return this._promise.finally(onfinally);
  }

  [Symbol.toStringTag]: string;
}