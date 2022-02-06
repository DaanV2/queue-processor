import { expect } from "chai";
import { QueueProcessor } from "../../src/types/QueueProcessor";

describe("queue-process", () => {
  it("simple test", (done) => {
    const items: number[] = [];
    const receiver: number[] = [];

    for (var I = 0; I < 100; I++) items.push(I);

    const process = (item: number) => {
      //console.log("adding: " + item)
      receiver.push(item);
    };
    const processor = new QueueProcessor(items, process);
    let thenCalled = false;

    process(-2);

    setTimeout(() => {
      process(-1);
    }, 0);

    processor.then(() => (thenCalled = true));
    processor.catch((err) => done(err));
    processor.finally(() => {
      expect(receiver.length).to.greaterThan(100);

      const index = receiver.lastIndexOf(-1);
      expect(index).to.be.greaterThanOrEqual(0, "expected to find a item");
      expect(index).to.be.lessThan(100, "expected the value to not be at the end");
      expect(thenCalled, "then was not called").to.be.true;
      done();
    });
  });

  it("error test", (done) => {
    const items: number[] = [];
    const receiver: number[] = [];

    for (var I = 0; I < 100; I++) items.push(I);

    const process = (item: number) => {
      //console.log("adding: " + item)
      if (item == 50) throw new Error("RIP");

      receiver.push(item);
    };
    const processor = new QueueProcessor(items, process);
    let caughtError = false;

    process(-2);

    setTimeout(() => {
      process(-1);
    }, 0);

    processor.then(() => console.log("done called"));
    processor.catch((err) => {
      if (err) caughtError = true;
    });
    processor.finally(() => {
      expect(receiver.length).to.greaterThan(100);

      const index = receiver.lastIndexOf(-1);
      expect(index).to.be.greaterThanOrEqual(0, "expected to find a item");
      expect(index).to.be.lessThan(100, "expected the value to not be at the end");
      expect(caughtError).to.be.true;
      done();
    });
  });

  it("advanced", (done) => {
    const items = ["example1", "example2", "example3", "example4", "example5"];

    let catchCalled = false;
    let thenCalled = false;

    const processor = new QueueProcessor(items, (item) => {
      return new Promise((resolve, reject) => {
        if (item === "example3") {
          reject(new Error("hello!"));
        }

        resolve();
      });
    });

    processor.then((items) => {
      thenCalled = true;
    });

    processor.catch((err) => {
      if (err) catchCalled = true;
    });

    processor.finally(() => {
      try {
        expect(thenCalled, "expected then to be called").to.be.false;
        expect(catchCalled, "expected catch to be called").to.be.true;
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("0 items call check", (done) => {
    const items: number[] = [];

    const processor = new QueueProcessor(items, (item) => {
      item += 1;
    });

    processor.finally(() => done());
  });

  describe("namespace", () => {
    it("forEach", (done) => {
      const data: number[] = [1, 2, 3, 4, 5];
      const result = 1 + 2 + 3 + 4 + 5;
      var out = 0;

      QueueProcessor.forEach<number>(data, (item) => {
        out += item;
      }).then((items) => {
        expect(out).to.equal(result);
        done();
      });
    });

    it("map", (done) => {
      const data: number[] = [1, 2, 3, 4, 5];

      QueueProcessor.map<number, string>(data, (item) => `${item}`).then((items) => {
        for (let I = 0; I < items.length; I++) {
          expect(typeof items[I]).to.equal("string");
        }

        done();
      });
    });

    it("filter", (done) => {
      const data: number[] = [1, 2, 3, 4, 5];

      QueueProcessor.filter(data, (item) => item % 2 === 0).then((items) => {
        expect(items).to.have.members([2, 4]);

        done();
      });
    });
  });
});
