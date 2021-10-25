import { expect } from 'chai';
import { QueueBatchProcessor } from '../../src/types/QueueBatchProcessor';

describe("queue-batch-process", () => {
  it("simple test", (done) => {
    const items: number[] = [];
    const receiver: number[] = [];

    for (var I = 0; I < 100; I++) items.push(I);

    const process = (item: number[], startindex: number) => {
      //console.log("adding batch at: " + startindex + `\n${item}`);
      receiver.push(...item);
    }
    const processor = new QueueBatchProcessor(items, process);
    let thenCalled = false;

    process([-2, -3], 0);

    setTimeout(() => { process([-1, -5], 0) }, 0);

    processor.then(() => {
      console.debug("then called");
      thenCalled = true
    });
    processor.catch(err => {
      console.debug("catch called");
    });
    processor.finally(() => {
      console.debug("finally called");
      try {
        const testitem = (item: number) => {
          const index = receiver.lastIndexOf(item);
          expect(index).to.be.greaterThanOrEqual(0, "expected to find a item: " + item);
          expect(index).to.be.lessThan(100, "expected the value to not be at the end: " + item);
        }

        const hasItem = (item : number) => {
          const index = receiver.lastIndexOf(item);
          expect(index).to.be.greaterThanOrEqual(0, "expected to find a item: " + item);
        }

        testitem(-1);
        testitem(-2);
        testitem(-3);
        testitem(-5);
        testitem(1);

        hasItem(30);
        hasItem(55);
        hasItem(66);
        hasItem(77);
        hasItem(88);
        hasItem(99);

        expect(thenCalled, "then was not called").to.be.true;
        expect(receiver.length).to.equal(100 + 2 + 2);
        done();
      }
      catch (err) {
        done(err);
      }
    });
  });

});