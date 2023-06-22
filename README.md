# Queue-Processor

A processor of collections that chunks the items into subsections. Each chunk is scheduled after when the previous chunk or item has been processed. This allows other workflows or scheduled work to execute before continuing on a large dataset. These processors try to keep the event loop as clean as possible. 

[![npm-publish](https://github.com/DaanV2/queue-processor/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/npm-publish.yml)
[![npm-test](https://github.com/DaanV2/queue-processor/actions/workflows/npm-test.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/npm-test.yml)
[![tagged-release](https://github.com/DaanV2/queue-processor/actions/workflows/tagged-release.yml/badge.svg)](https://github.com/DaanV2/queue-processor/actions/workflows/tagged-release.yml)

## Why would you need this?

I have an extension that takes a ~30 to process a couple of hundred files, summarize them and diagnose problems; this all takes CPU time. While at the same time, I wanted to give priority to smaller and faster takes, in which I needed a library that could ensure that things got chunked into smaller pieces of work. So other smaller tasks could be done in between the large parts.

Pros:
- Faster response times on other tasks/processes as they also get their time to shine.
Cons:
- Slightly slower. Chunking a process and allowing other tasks to go first determines how long it takes to finish something.

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
