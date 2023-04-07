# Queue-Processor

A processor of collections that cuts up promisings time into chunks to allow other tasks/processes to also get some CPU. A promise like processor that tries to keep the event-loop as clean as possible. It cuts up the processing of events into smaller chunks and processes them in after each other. but allowing other events to go first.

[![npm-publish](https://github.com/DaanV2/queue-processor/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/npm-publish.yml)
[![npm-test](https://github.com/DaanV2/queue-processor/actions/workflows/npm-test.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/npm-test.yml)
[![tagged-release](https://github.com/DaanV2/queue-processor/actions/workflows/tagged-release.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/tagged-release.yml)

## Why would you need this?

I have an extension that takes a ~30 to process couple of hunderd of files, summarize them and diagnose problems, this all takes CPU time to do. While at the same time I want to give priority to smaller and faster takes in which I needed a library that could ensure that things got chunked into smaller pieces of work. So other smaller tasks could be done inbetween the large parts.

Pros:
- Faster respond times on other tasks/processes as they get their time to shine as well.
Cons
- Slightly slower. Chunk a process and allowing other tasks to go first does how long it takes before something is finished.

## Example

```ts
  //The array of items to process
  const items : T[] = getItems();

  //Processes for each
  QueueProcessor.forEach(items, (item)=>console.log(item));

  //Map each item
  const mapped : U[] = QueueProcessor.map(items, (item)=>convert(item));

  //Filter each item
  const filtered : T[] = QueueProcessor.filter(items, (item)=>item === ...);

  //Processes for each, then use the promise to wait for the result
  QueueProcessor.forEach(items, (item)=>console.log(item)).then(items=>{...});

  //Async await code
  const items = await QueueProcessor.forEach(items, (item)=>console.log(item));
```

## How to works

The processor is meant to keep the event loop as free as possible while processing a large collection of items. It also keeps the time between each
item processed in the event loop as small as possible. Each item is processed separately on the event loop as a separate item. But each item is added
to the loop after the previous item has been processed.

This allows other items that have been added to the queue to be processed much earlier. This will slow down your overall processing of all the items,
but the benefit is that other calls can be handled as well.

There is also a batch processor that sends of a whole series of items to the callback item to be processed.
