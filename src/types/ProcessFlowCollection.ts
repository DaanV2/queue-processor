import { ProcessFlow } from './ProcessFlow';
import { PromiseWrapper } from './PromiseWrapper';

/**A class that can handle multiple awaiting promises*/
export class ProcessFlowCollection<T> implements ProcessFlow<T> {
  private _promises: ProcessFlow<T>[];

  /**Creates a new instance of ProcessFlowCollection<T>*/
  constructor() {
    this._promises = [];
  }

  /**Adds a new Processflow onto the collection
   * @param item 
   * @returns 
   */
  push(item: ProcessFlow<T>): number {
    return this._promises.push(item);
  }

  /**Creates, registers and then returns a new PromiseWraper<T>
   * @returns A new PromiseWrapper*/
  new(): PromiseWrapper<T> {
    const p = new PromiseWrapper<T>();
    this._promises.push(p);

    return p;
  }

  /**Resolves all internal promises
   * @param item The item to pass of to the promises*/
  resolve(item: T): void {
    this._promises.forEach(p => p.resolve(item));
  }

  /**Rejects all internal promises
   * @param reason The error / reason to reject*/
  reject(reason: any) {
    this._promises.forEach(p => p.reject(reason));
  }
}