import { ProcessFlow } from './ProcessFlow';

export class PromiseWarpper<T> implements ProcessFlow<T>, Promise<T> {
  private _promise: Promise<T>;
  private _resolve?: (value: T | PromiseLike<T>) => void;
  private _reject?: (reason?: any) => void;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    })
  }


  resolve(item: T): void {
    if (this._resolve) this._resolve(item);
  }

  reject(reason?: any): void {
    if (this._reject) this._reject(reason);
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    return this._promise.then<TResult1, TResult2>(onfulfilled, onrejected);
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult> {
    return this._promise.catch<TResult>(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T> {
    return this._promise.finally(onfinally);
  }

  [Symbol.toStringTag]: string;
}