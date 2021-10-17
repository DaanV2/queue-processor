import { timeStamp } from 'console';
import { setTimeout } from 'timers/promises';
import { runInThisContext } from 'vm';
import { ItemError, QueueError } from './errors';


/**
 * 
 */
export class QueueProcessor<T> implements Promise<T[]> {
  /** The items to process */
  private _items: T[];
  /** The function to call for each item */
  private _callbackfn: (item: T, index: number, items: T[]) => void;

  //The index of the current item being processed
  private _index: number;
  //The delay of the each iteration
  private _delay: number;

  //General
  private _general_promises: ProcessFlowCollection<T[]>;
  private _errors: any[];

  /**Creates a new instance of QueueProcessor<T>
   * @param items The items to loop over
   * @param callbackfn The function to call per item
   */
  constructor(items: T[], callbackfn: (item: T, index: number, items: T[]) => void, delay: number = 0) {
    this._items = items;
    this._callbackfn = callbackfn;

    //We start with the first item
    this._index = 0;
    this._delay = delay;

    this._general_promises = new ProcessFlowCollection<T[]>();
    this._errors = [];

    this.Process();
  }

  private Process() {
    setTimeout(0, this.nextItem());
  }

  private nextItem(): void {
    const index = this._index;
    this._index++;

    //If we are at the end, then finish off the queue
    if (index >= this._items.length) return this.finishQueue();

    //get item to process
    const item = this._items[index];

    try {
      //Preform call
      this._callbackfn(item, index, this._items);
    }
    catch (err: any) {
      if (typeof err === undefined || typeof err.message !== "string") {
        err = ItemError.create("unknown error", item, index);
      }
      else {
        err = <ItemError<T>>(err);
        err.index = index;
        err.item = item;
      }

      this._errors.push(err);
    }

    this.Process();
  }

  private finishQueue(): void {
    //We got errors so reject
    if (this._errors.length > 0) {
      const err = QueueError.create(`While processing, received ${this._errors.length}x errors`, this._errors);

      return this._general_promises.reject(err);
    }

    //No errors
    return this._general_promises.resolve(this._items);
  }

  //#region  Promise implementation

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1[] | TResult2> {
    return this._general_promises.new().then<TResult1, TResult2>(onfulfilled, onrejected);
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T[] | TResult> {
    return this._general_promises.new().catch<TResult>(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T[]> {
    return this._general_promises.new().finally(onfinally);
  }

  [Symbol.toStringTag]: string;

  //#endregion
}



interface ProcessFlow<T> {
  resolve(item: T): void;
  reject(reason: any): void;
}


class ProcessFlowCollection<T> implements ProcessFlow<T> {
  private _promises: ProcessFlow<T>[];

  constructor() {
    this._promises = [];
  }

  push(item: ProcessFlow<T>): number {
    return this._promises.push(item);
  }

  new(): PromiseWarpper<T> {
    const p = new PromiseWarpper<T>();
    this._promises.push(p);

    return p;
  }

  resolve(item: T): void {
    this._promises.forEach(p => p.resolve(item));
  }

  reject(reason: any) {
    this._promises.forEach(p => p.reject(reason));
  }
}


class PromiseWarpper<T> implements ProcessFlow<T>, Promise<T> {
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