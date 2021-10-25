import { BaseProcessor } from './BaseProcessor';


/**
 * 
 */
export class QueueProcessor<T> extends BaseProcessor<T> {
  /** The function to call for each item */
  private _callbackfn: (item: T, index: number, items: T[]) => void;

  /**Creates a new instance of QueueProcessor<T>
   * @param items The items to loop over
   * @param callbackfn The function to call per item
   * @param startindex  
   * @param delay  
   */
  constructor(items: T[], callbackfn: (item: T, index: number, items: T[]) => void, startindex: number = 0, delay: number = 0) {
    super(items, startindex, delay);
    this._callbackfn = callbackfn;

    this.Process();
  }

  /**
   * 
   * @returns 
   */
  protected override nextItem(): void {
    const index = this._index;
    this._index++;

    //If we are at the end, then finish off the queue
    if (index >= this._items.length) return this.finish();

    //get item to process
    const item = this._items[index];

    try {
      //Preform call
      this._callbackfn(item, index, this._items);
    }
    catch (err: any) {
      this.errorItem(item, err, index);
    }

    this.Process();
  }
}