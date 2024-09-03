import { IO } from "./io";

describe("IO", () => {
  describe("static methods", () => {
    it("should create an IO monad from a constant value", () => {
      const expectedValue = 42;
      const io = IO.from(expectedValue);
      expect(io.run()).resolves.toBe(expectedValue);
    });

    it("should create an IO monad from a Promise-returning function", async () => {
      const promise = Promise.resolve("hello");
      const io = IO.fromPromise(() => promise);
      expect(await io.run()).toBe("hello");
    });

    it("should create an Unit IO monad", async () => {
      const io = IO.unit;
      expect(await io.run()).toBeUndefined();
    });
  });

  it("should handle errors and recover with a fallback value", async () => {
    const errorIO: IO<number> = IO.fromPromise(() =>
      Promise.reject(new Error("Oops!"))
    );
    const recoveredIO = errorIO.catch(() => IO.from(5));
    expect(await recoveredIO.run()).toBe(5);
  });

  it("should handle nested chaining of multiple IO instances", async () => {
    const io = IO.from(4)
      .chain((value) => IO.from(value + 2))
      .chain((value) => IO.from(value * 3))
      .chain((value) => IO.from(value / 2));

    expect(await io.run()).toBe(9);
  });

  it("should handle double-wrapped IO instances with IO.from", async () => {
    const value = 10;
    const innerIO = IO.from(value);
    const outerIO = IO.from(innerIO);

    expect(await outerIO.run()).toBe(value);
  });

  it("should handle double-wrapped IO instances within chain", async () => {
    const value = 5;
    const innerIO = IO.from(value);
    const outerIO = IO.from(innerIO);

    const io = IO.from(1)
      .chain((v) => outerIO)
      .chain((v) => IO.from(v * 2));

    expect(await io.run()).toBe(value * 2);
  });

  it("should propagate errors from chained functions", async () => {
    const errorIO = IO.from(5).chain((value) =>
      IO.fromPromise(() => Promise.reject(new Error("Error in chain")))
    );

    await expect(errorIO.run()).rejects.toThrow("Error in chain");
  });

  it("should handle errors within nested IO instances", async () => {
    const errorIO = IO.fromPromise(() => Promise.resolve(4)).chain((value) =>
      IO.fromPromise(() => Promise.reject(new Error("Nested error")))
    );

    await expect(errorIO.run()).rejects.toThrow("Nested error");
  });

  it("should handle function returning a plain value within chain", async () => {
    const io = IO.from(5).chain((value) => IO.from(value * 2)); // Function returns a plain value

    expect(await io.run()).toBe(10);
  });

  it("should handle function returning an IO instance within chain", async () => {
    const nestedIO = IO.from(3);
    const io = IO.from(1).chain((value) => nestedIO); // Function returns an IO instance

    expect(await io.run()).toBe(3);
  });

  it("should chain with a nested IO return value", async () => {
    const nestedIO = IO.from(5);
    const io = IO.from(1).chain((value) => nestedIO);
    expect(await io.run()).toBe(5);
  });

  it("should execute the effect and return a Promise", async () => {
    const io = IO.fromPromise(() => Promise.resolve("result"));
    expect(await io.run()).toBe("result");
  });
});
