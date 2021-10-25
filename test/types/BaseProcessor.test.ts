import { BaseProcessor } from '../../src/types/BaseProcessor';

class ExposedBaseProcessor<T> extends BaseProcessor<T> {
  protected nextItem(): void { }

  constructor(items: T[]) {
    super(items);
  }

  exposedResolve() {
    return this.resolve();
  }

  exposedReject() {
    return this.reject();
  }

  exposedFinished() {
    return this.finish();
  }

  exposedErrorItem(item: T, err: any, index: number) {
    return this.errorItem(item, err, index)
  }
}

describe("BaseProcessor", () => {
  it("then", (done) => {
    let p = new ExposedBaseProcessor<number>([0, 1, 2]);
    p.then((values) => done());

    p.exposedResolve();
  });

  it("then2", (done) => {
    let p = new ExposedBaseProcessor<number>([0, 1, 2]);
    p.then((values) => done());

    p.exposedFinished();
  });

  it("catch", (done) => {
    let p = new ExposedBaseProcessor<number>([0, 1, 2]);

    p.exposedErrorItem(1, { message: "example" }, 1);
    p.catch((err) => done());

    p.exposedReject()
  });

  it("catch2", (done) => {
    let p = new ExposedBaseProcessor<number>([0, 1, 2]);

    p.exposedErrorItem(1, { message: "example" }, 1);
    p.catch((err) => done());

    p.exposedFinished();
  });

  it("finally", (done) => {
    let p = new ExposedBaseProcessor<number>([0, 1, 2]);

    p.exposedErrorItem(1, { message: "example" }, 1);
    p.finally(() => done());

    p.exposedReject()
  });

  it("finally2", (done) => {
    let p = new ExposedBaseProcessor<number>([0, 1, 2]);

    p.exposedErrorItem(1, { message: "example" }, 1);
    p.finally(() => done());

    p.exposedResolve()
  });

  it("finally3", (done) => {
    let p = new ExposedBaseProcessor<number>([0, 1, 2]);

    p.exposedErrorItem(1, { message: "example" }, 1);
    p.finally(() => done());

    p.exposedFinished();
  });

  it("finally4", (done) => {
    let p = new ExposedBaseProcessor<number>([0, 1, 2]);

    p.finally(() => done());

    p.exposedFinished();
  });

});