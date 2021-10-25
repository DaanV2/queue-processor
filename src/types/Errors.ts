export interface ItemError<T> extends Error {
  item: T;
  index: number;
}

export namespace ItemError {
  export function is<T>(value: any): value is ItemError<T> {
    if (typeof value === "object") {
      if (typeof value.message !== "string") return false;
      if (typeof value.item === "undefined") return false;
      if (typeof value.index !== 'number') return false;

      return true;
    }

    return false;
  }

  export function create<T>(message: string, item: T, index: number): ItemError<T> {
    const out = <ItemError<T>>(new Error(message));

    out.index = index;
    out.item = item;
    out.name = "ItemError";

    return out;
  }
}


export interface QueueError extends Error {
  errors: any[];
}

export namespace QueueError {
  export function is(value: any): value is QueueError {
    if (typeof value === "object") {
      if (typeof value.message !== "string") return false;
      if (Array.isArray(value.errors)) return true;

      return false;
    }

    return false;
  }

  export function create(message: string, errors: any[]): QueueError {
    const out = <QueueError>(new Error(message));

    out.name = "QueueError";
    out.errors = errors;

    return out;
  }
}