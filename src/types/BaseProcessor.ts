import { ItemError, QueueError } from './Errors';
import { ProcessFlowCollection } from './ProcessFlow';

export abstract class BaseProcessor<T> implements Promise<T[]> {
  /** */
  protected _general_promises: ProcessFlowCollection<T[]>;
  /** */
  protected _errors: any[];
  /** The items to process */
  protected _items: T[];

  /** The index of the current item being processed*/
  protected _index: number;
  /** The delay of the each iteration*/
  protected _delay: number;

  /**
   * 
   * @param items 
   * @param startindex 
   * @param delay 
   */
  constructor(items: T[], startindex: number = 0, delay: number = 0) {
    this._general_promises = new ProcessFlowCollection<T[]>();
    this._errors = [];
    this._items = items;
    this._index = startindex;
    this._delay = delay;
  }

  /** */
  protected resolve() {
    return this._general_promises.resolve(this._items);
  }

  /** */
  protected reject() {
    return this._general_promises.reject(this._items);
  }

  /**
   * 
   * @param item 
   * @param err 
   * @param index 
   * @returns 
   */
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

  /** */
  protected finish(): void {
    //We got errors so reject
    if (this._errors.length > 0) {
      const err = QueueError.create(`While processing, received ${this._errors.length}x errors`, this._errors);

      return this._general_promises.reject(err);
    }

    //No errors
    return this._general_promises.resolve(this._items);
  }

  /**
   * 
   * @returns 
   */
  protected Process() {
    return setTimeout(() => this.nextItem(), this._delay)
  }

  /**
   * 
   */
   protected abstract nextItem(): void;

  /**
   * 
   * @param onfulfilled 
   * @param onrejected 
   * @returns 
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    return this._general_promises.new().then<TResult1, TResult2>(onfulfilled, onrejected);
  }

  /**
   * 
   * @param onrejected 
   * @returns 
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T[] | TResult> {
    return this._general_promises.new().catch<TResult>(onrejected);
  }

  /**
   * 
   * @param onfinally 
   * @returns 
   */
  finally(onfinally?: (() => void) | null): Promise<T[]> {
    return this._general_promises.new().finally(onfinally);
  }

  [Symbol.toStringTag]: string;
}