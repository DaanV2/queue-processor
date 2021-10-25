import { PromiseWarpper } from './PromiseWarpper';

/** 
 * 
*/
export interface ProcessFlow<T> {
  /**
   * 
   * @param item 
   */
  resolve(item: T): void;

  /**
   * 
   * @param reason 
   */
  reject(reason: any): void;
}

/**
 * 
 */
export class ProcessFlowCollection<T> implements ProcessFlow<T> {
  private _promises: ProcessFlow<T>[];

  /** */
  constructor() {
    this._promises = [];
  }

  /**
   * 
   * @param item 
   * @returns 
   */
  push(item: ProcessFlow<T>): number {
    return this._promises.push(item);
  }

  /**
   * 
   * @returns 
   */
  new(): PromiseWarpper<T> {
    const p = new PromiseWarpper<T>();
    this._promises.push(p);

    return p;
  }

  /**
   * 
   * @param item 
   */
  resolve(item: T): void {
    this._promises.forEach(p => p.resolve(item));
  }

  /**
   * 
   * @param reason 
   */
  reject(reason: any) {
    this._promises.forEach(p => p.reject(reason));
  }
}