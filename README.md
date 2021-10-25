# Queue-Processor

A promise like processor that tries to keep the event-loop as clean as possible

[![npm-publish](https://github.com/DaanV2/queue-processor/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/npm-publish.yml)
[![npm-test](https://github.com/DaanV2/queue-processor/actions/workflows/npm-test.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/npm-test.yml)
[![tagged-release](https://github.com/DaanV2/queue-processor/actions/workflows/tagged-release.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/tagged-release.yml)

## Example

```ts
  //The array of items to process
  const items : T[] = getItems();
  //The callback function for each item
  const process_item : (item : T) => { ... }

  //Makes a new queue processor
  const processor = new QueueProcessor<T>(items, process_item);

  //A promise implementation around the processor
  processor.then((items)=>{ ... });

  //The possible error returned is of type QueueError
  processor.catch((err)=> { ... );
  processor.finaly(()=>{ ... });

  //OR

  //Makes a new queue batch processor
  const processor = new QueueBatchProcessor<T>(items, process_item);

  //A promise implementation around the processor
  processor.then((items)=>{ ... });

  //The possible error returned is of type QueueError
  processor.catch((err)=> { ... );
  processor.finaly(()=>{ ... });
```

## How to works

The processor is meant to keep the event loop as free as possible while processing a large collection of items. It also keeps the time between each
item processed in the event loop as small as possible. Each item is processed seperatly on the event loop as a seperate items. But each item is added
to the loop after the previous item has been processed.

This allows other items that have been added to the queue to be processed much earlier. This will slow down your overall processing of all the items,
but the benefit is that other calls can be handled as well.

There is also a batch processor that sends of a whole series of items to the callback item to be processed.
