/**An item error, registers the information on what item, index and the error itself was thrown*/
export interface ItemError<T> extends Error {
  /**The item that caused the issue*/
  item: T;
  /**The index of the items in the collection*/
  index: number;
}

/**The namespace that provides functions for ItemError<T> */
export namespace ItemError {
  /**Checks if the given value implements the given ItemError<T> interface, cannot actually check if value.item is of type T
   * @param value The value to check
   * @returns true / false   */
  export function is<T>(value: any): value is ItemError<T> {
    if (typeof value === "object") {
      if (typeof value.message !== "string") return false;
      if (typeof value.item === "undefined") return false;
      if (typeof value.index !== "number") return false;

      return true;
    }

    return false;
  }

  /**Creates a new item error around the given error message, item and index*/
  export function create<T>(message: string, item: T, index: number): ItemError<T> {
    const out = <ItemError<T>>new Error(message);
    out.index = index;
    out.item = item;
    out.name = "ItemError";
    return out;
  }
}

/**An error that is thrown when the queue has experienced (Errors) Provides each seperate error as an ItemError<T>*/
export interface QueueError extends Error {
  /**The collected errors*/
  errors: any[];
}

/**The namespace that provides functions for QueueError*/
export namespace QueueError {
  /**Checks if the given value implements the given QueueError
   * @param value The value to check
   * @returns true / false   */
  export function is(value: any): value is QueueError {
    if (typeof value === "object") {
      if (typeof value.message !== "string") return false;
      if (Array.isArray(value.errors)) return true;

      return false;
    }

    return false;
  }

  /**Creates a new queue error*/
  export function create(message: string, errors: any[]): QueueError {
    const out = <QueueError>new Error(message);

    out.name = "QueueError";
    out.errors = errors;

    return out;
  }
}
