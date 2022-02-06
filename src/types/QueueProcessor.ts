import { ItemError, QueueError } from "./Errors";
import { ProcessFlowCollection } from "./ProcessFlow";

type forEachfn<T> = (items: T, startindex: number, collection: T[]) => void | Promise<void>;
type mapfn<T, U> = (items: T, startindex: number, collection: T[]) => U | Promise<U>;
type predicate<T> = (value: T, index: number, array: T[]) => unknown;

/**A processor that handles the given items in batches. This increases the time spent on each event in the eventloop but shortens the time the eventloop takes to process all items*/
export class QueueProcessor<T> implements Promise<T[]> {
  //#region fields

  /**The amount of items to process */
  private _batchsize: number;
  /** The function to call for each item */
  protected _callbackfn: (item: T, startindex: number, collection: T[]) => Promise<void> | void;

  /**Promises to be rejected / resolved when this processing is done*/
  protected _general_promises: ProcessFlowCollection<T[]>;
  /**Collected errors*/
  protected _errors: any[];
  /**The items to process*/
  protected _items: T[];

  /**The index of the current item being processed*/
  protected _index: number;
  /**The delay of the each iteration*/
  protected _delay: number;

  //#endregion

  /**Creates a new instance of QueueProcessor<T>
   * @param items The items to loop over
   * @param callbackfn The function to call per item
   * @param delay The delay between items*/
  constructor(items: T[], callbackfn: forEachfn<T>, batchsize: number = -1, startindex: number = 0, delay: number = 0) {
    this._callbackfn = callbackfn;
    this._general_promises = new ProcessFlowCollection<T[]>();
    this._errors = [];
    this._items = items;
    this._index = startindex;
    this._delay = delay;

    //Check batch size, if invalid, then take either 1 or the square root of the amount of items to process
    if (batchsize < 0) batchsize = Math.max(Math.trunc(Math.sqrt(items.length > 1 ? items.length : 1)), 1);

    //console.debug(batchsize);
    this._batchsize = batchsize;

    setTimeout(() => this.Process());
  }

  /**Throws the next item on the event loop, or if this processor is at the end, will resolves all promises*/
  protected Process(): void {
    //If we are at the end, finish up the que
    if (this._index >= this._items.length) return this.finish();

    //Else process next item
    setTimeout(() => {
      this.ProcessNextItem();
    }, this._delay);
  }

  /**Processes the next item(s) in the collection*/
  protected ProcessNextItem(): void {
    //get item to process
    const index = this._index;
    const max = Math.min(this._items.length, index + this._batchsize);
    const promises: Promise<void>[] = [];

    //Keep this._items.length if case someone messed with the item set
    for (let I = index; I < max; I++) {
      const p = this.ProcessItem(I);
      promises.push(p);
      this._index++;
    }

    Promise.all(promises).finally(() => this.Process());
  }

  /**Process the next item in queue, assumed is this function either call this.Process or this.finish*/
  protected ProcessItem(index: number): Promise<void> {
    let t: Promise<void> | void | undefined;
    const item = this._items[index];

    try {
      t = this._callbackfn(item, index, this._items);
    } catch (err) {
      this.errorItem(item, err, index);
    }

    //Is the returned type an object
    if (typeof t === "object") {
      t.catch((err) => this.errorItem(item, err, index));
      return t;
    }

    return Promise.resolve();
  }

  //#region Promise

  /**Resolves all promises and provides them with context information*/
  protected resolve() {
    //console.debug('resolve');
    return this._general_promises.resolve(this._items);
  }

  /**Resolves all promises and provides them with context information*/
  protected reject() {
    //console.debug('reject');
    return this._general_promises.reject(this._items);
  }

  /**Wraps up the processing of this processor and fires off the nesscary queued promises*/
  protected finish(): void {
    //console.debug('finishing');
    //We got errors so reject
    if (this._errors.length > 0) {
      const err = QueueError.create(`While processing, received ${this._errors.length}x errors`, this._errors);

      return this._general_promises.reject(err);
    }

    //No errors
    return this._general_promises.resolve(this._items);
  }

  /**Creates a new error item in this instance
   * @param item The item that caused the error
   * @param err The err object
   * @param index The index of the item
   * @returns A ItemError<T>*/
  protected errorItem(item: T, err: any | undefined, index: number): ItemError<T> {
    if (typeof err === undefined || typeof err.message !== "string") {
      err = ItemError.create("unknown error", item, index);
    } else {
      err = <ItemError<T>>err;
      err.index = index;
      err.item = item;
    }

    this._errors.push(err);
    return err;
  }

  /**Attaches callbacks for the resolution and/or rejection of the Promise
   * @param onfulfilled The function to call when the Promise is resolved
   * @param onrejected The function to call when the Promise is rejected
   * @returns A promise*/
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this._general_promises.new().then<TResult1, TResult2>(onfulfilled, onrejected);
  }

  /**Attaches a callback for only the rejection of the Promise.
   * @param onrejected The function to call when the Promise is rejected
   * @returns A promise*/
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T[] | TResult> {
    return this._general_promises.new().catch<TResult>(onrejected);
  }

  /**Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The resolved value cannot be modified from the callback.
   * @param onfinally The function to call when the Promise is settled (fulfilled or rejected)
   * @returns A promise*/
  finally(onfinally?: (() => void) | null): Promise<T[]> {
    return this._general_promises.new().finally(onfinally);
  }

  [Symbol.toStringTag]: string;
  //#endregion
}

/**The namespace that provides quick access to QueueProcessor methods*/
export namespace QueueProcessor {
  /**Processes each item in the collection with the given callback
   * @param items The items to process
   * @param callbackfn The function to call per item
   * @param batchsize The number of items to process at once
   * @param startindex The index to start processing at
   * @param delay The delay in milliseconds to wait before processing the next item
   * @returns A promise that returned the processed items*/
  export async function forEach<T>(items: T[], callbackfn: forEachfn<T>, batchsize?: number, startindex?: number, delay?: number): Promise<T[]> {
    return new QueueProcessor<T>(items, callbackfn, batchsize, startindex, delay);
  }

  /**Filters the items in the collection with the given callback
   * @param items The items to process
   * @param callbackfn The function to call per item
   * @param batchsize The number of items to process at once
   * @param startindex The index to start processing at
   * @param delay The delay in milliseconds to wait before processing the next item
   * @returns A promise that returned the filtered items*/
  export async function filter<T, S extends T>(
    items: T[],
    callbackfn: predicate<T>,
    batchsize?: number,
    startindex?: number,
    delay?: number
  ): Promise<T[]> {
    const out: T[] = [];

    const call: forEachfn<T> = (item, index, items) => {
      if (callbackfn(item, index, items)) out.push(item);
    };

    await forEach(items, call, batchsize, startindex, delay);
    return out;
  }

  /**Maps the items in the collection with the given callback
   * @param items The items to process
   * @param callbackfn The function to call per item
   * @param batchsize The number of items to process at once
   * @param startindex The index to start processing at
   * @param delay The delay in milliseconds to wait before processing the next item
   * @returns A promise that returned the mapped items*/
  export async function map<T, U>(items: T[], callbackfn: mapfn<T, U>, batchsize?: number, startindex?: number, delay?: number): Promise<U[]> {
    const out: U[] = [];

    const call: forEachfn<T> = (item, index, items) => {
      const temp = callbackfn(item, index, items);
      const p = <Promise<U>>temp;

      if (typeof p === "object" && typeof p.then === "function") {
        p.then((v) => out.push(v));
      } else {
        out.push(<U>temp);
      }
    };

    await forEach<T>(items, call, batchsize, startindex, delay);
    return out;
  }
}
