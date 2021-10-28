import { ItemError, QueueError } from './Errors';
import { ProcessFlowCollection } from './ProcessFlowCollection';

export abstract class BaseProcessor<T> implements Promise<T[]> {
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

  /**Initialize a new BaseProcessor<T>
   * @param items The item to process
   * @param callbackfn The callback fn to process each item in
   * @param startindex The startindex
   * @param delay The delay between each call*/
  constructor(items: T[], callbackfn: (items: T, startindex: number, collection: T[]) => Promise<void> | void, startindex: number = 0, delay: number = 0) {
    this._callbackfn = callbackfn;
    this._general_promises = new ProcessFlowCollection<T[]>();
    this._errors = [];
    this._items = items;
    this._index = startindex;
    this._delay = delay;
  }

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

  /**Creates a new error item in this instance
   * @param item The item that caused the error
   * @param err The err object
   * @param index The index of the item
   * @returns A ItemError<T>*/
  protected errorItem(item: T, err: any | undefined, index: number): ItemError<T> {
    if (typeof err === undefined || typeof err.message !== "string") {
      err = ItemError.create("unknown error", item, index);
    }
    else {
      err = <ItemError<T>>(err);
      err.index = index;
      err.item = item;
    }

    this._errors.push(err);
    return err;
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

  /**Throws the next item on the event loop, or if this processor is at the end, will resolves all promises
   * @returns */
  protected Process(): void {
    //If we are at the end, finish up the que
    if (this._index >= this._items.length) return this.finish();

    //Else process next item
    setTimeout(() => { this.ProcessNextItem() }, this._delay);
  }

  /**
   * 
   * @returns 
   */
  protected ProcessItem(index: number): Promise<void> {
    let t: Promise<void> | void | undefined;
    const item = this._items[index];

    try {
      t = this._callbackfn(item, index, this._items);
    }
    catch (err) {
      this.errorItem(item, err, index);
    }

    if (typeof t === 'object') {
      t.catch(err => this.errorItem(item, err, index));
      return t;
    }

    return Promise.resolve();
  }

  /**Process the next item in queue, assumed is this function either call this.Process or this.finish*/
  protected abstract ProcessNextItem(): void;

  /**Attaches callbacks for the resolution and/or rejection of the Promise
   * @param onfulfilled 
   * @param onrejected 
   * @returns 
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    return this._general_promises.new().then<TResult1, TResult2>(onfulfilled, onrejected);
  }

  /**Attaches a callback for only the rejection of the Promise.
   * @param onrejected 
   * @returns 
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T[] | TResult> {
    return this._general_promises.new().catch<TResult>(onrejected);
  }

  /**Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The resolved value cannot be modified from the callback.
   * @param onfinally 
   * @returns 
   */
  finally(onfinally?: (() => void) | null): Promise<T[]> {
    return this._general_promises.new().finally(onfinally);
  }

  [Symbol.toStringTag]: string;
}