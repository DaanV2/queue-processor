import { BaseProcessor } from './BaseProcessor';

/**A processor that handles the given items seperalty as a single event on the evenloop.*/
export class QueueProcessor<T> extends BaseProcessor<T> {
  /**Creates a new instance of QueueProcessor<T>
   * @param items The items to loop over
   * @param callbackfn The function to call per item
   * @param startindex The index to start at
   * @param delay The delay between calls*/
  constructor(items: T[], callbackfn: (item: T, index: number, items: T[]) => void, startindex: number = 0, delay: number = 0) {
    super(items, callbackfn, startindex, delay);
    this._callbackfn = callbackfn;

    this.Process();
  }

  protected override ProcessNextItem(): void {
    const index = this._index;
    this._index++;

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