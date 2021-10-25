import { BaseProcessor } from './BaseProcessor';

/**A processor that handles the given items in batches. This increases the time spent on each event in the eventloop but shortens the time the eventloop takes to process all items*/
export class QueueBatchProcessor<T> extends BaseProcessor<T> {
  /**The amount of items to process */
  private _batchsize: number;

  /**Creates a new instance of QueueProcessor<T>
   * @param items The items to loop over
   * @param callbackfn The function to call per item
   * @param delay The delay between items*/
  constructor(items: T[], callbackfn: (items: T, startindex: number, collection: T[]) => void, batchsize: number = -1, startindex: number = 0, delay: number = 0) {
    super(items, callbackfn, startindex, delay);

    //Check batch size, if invalid, then take either 1 or the square root of the amount of items to process
    if (batchsize < 0) batchsize = Math.max(Math.trunc(Math.sqrt(items.length)), 1);

    //console.debug(batchsize);
    this._batchsize = batchsize;

    this.Process();
  }

  protected override ProcessNextItem(): void {
    const index = this._index;

    //get item to process
    const item = this._items[index];

    let I;
    const max = index + this._batchsize;
    //Keep this._items.length if case someone messed with the item set
    for (I = index; I > Math.min(this._items.length, max); I++) {
      try {
        const item = this._items[I];
        //Preform call
        this._callbackfn(item, index, this._items);
      }
      catch (err: any) {
        this.errorItem(item, err, index);
      }
    }

    if (this._index <= I) {
      this._index++;
    }
    else {
      this._index = I;
    }

    this.Process();
  }
}