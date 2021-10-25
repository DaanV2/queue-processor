import { BaseProcessor } from './BaseProcessor';

/**
 * 
 */
export class QueueBatchProcessor<T> extends BaseProcessor<T> {
  /** The function to call for each item */
  private _callbackfn: (items: T[], startindex: number, collection: T[]) => void;

  private _batchsize: number;

  /**Creates a new instance of QueueProcessor<T>
   * @param items The items to loop over
   * @param callbackfn The function to call per item
   * @param delay  
   */
  constructor(items: T[], callbackfn: (items: T[], startindex: number, collection: T[]) => void, batchsize: number = -1, startindex: number = 0, delay: number = 0) {
    super(items, startindex, delay);

    //Check batch size
    if (batchsize < 0) batchsize = Math.max(Math.trunc(Math.sqrt(items.length)), 1);

    //console.debug(batchsize);
    this._batchsize = batchsize;
    this._callbackfn = callbackfn;

    this.Process();
  }

  /**
   * 
   * @returns 
   */
  protected override nextItem(): void {
    const index = this._index;
    //console.log(index);

    //If we are at the end, then finish off the queue
    if (index >= this._items.length) return this.finish();

    //get item to process
    const item = this._items[index];
    let batch: T[] | undefined;

    try {
      batch = this._items.slice(index, index + this._batchsize);

      //Preform call
      this._callbackfn(batch, index, this._items);
    }
    catch (err: any) {
      this.errorItem(item, err, index);
    }

    let diff = (batch ? batch.length : 1);
    this._index = index + (diff > 0 ? diff : 1);

    this.Process();
  }

  [Symbol.toStringTag]: string;
}