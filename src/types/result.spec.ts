import { Result, ResultPattern } from "./result";

describe("Result", () => {
  describe("Creation and basic checks", () => {
    it("should create Ok(value)", () => {
      const result = Result.ok("data");
      expect(result.isOk()).toBeTruthy();
      expect(result.isErr()).toBeFalsy();
      expect(result.unwrap()).toBe("data");
    });

    it("should create Err(error)", () => {
      const error = new Error("Something went wrong!");
      const result = Result.err(error);
      expect(result.isOk()).toBeFalsy();
      expect(result.isErr()).toBeTruthy();
      expect(result.unwrapErr()).toBe(error);
      expect(() => result.unwrap()).toThrow();
    });

    it("should create Ok from a valid value", () => {
      const result = Result.ok(42);
      expect(result.isOk()).toBeTruthy();
    });

    it("should create Err from an error value", () => {
      const result = Result.err("Error message");
      expect(result.isErr()).toBeTruthy();
    });
  });

  describe("Handling Ok and Err variants", () => {
    it("should check for Ok and Err variants (isOk, isErr)", () => {
      const okResult = Result.ok("data");
      const errResult = Result.err(new Error("error"));

      expect(okResult.isOk()).toBeTruthy();
      expect(okResult.isErr()).toBeFalsy();

      expect(errResult.isOk()).toBeFalsy();
      expect(errResult.isErr()).toBeTruthy();
    });

    it("should access the value from an Ok result (expect)", () => {
      const result = Result.ok("data");
      expect(result.expect("Error message when result is Err")).toBe("data");
    });

    it("should panic on expect with Err (expect.assertions(1))", () => {
      expect(() =>
        Result.err(new Error("error")).expect("This should panic")
      ).toThrow();
    });

    it("should provide a default value with unwrapOr", () => {
      const result: Result<string, Error> = Result.err(new Error("error"));
      const defaultValue = "default value";
      expect(result.unwrapOr(defaultValue)).toBe(defaultValue);
    });

    it("should access the value from an Ok result with unwrap", () => {
      const result = Result.ok("data");
      expect(result.unwrap()).toBe("data");
    });

    it("should return the value from an Ok result", () => {
      const value = "data";
      const result = Result.ok(value);
      const unwrappedValue = result.unwrapOr("default"); // Default value is not used
      expect(unwrappedValue).toEqual(value);
    });

    it("should return the default value if the result is Err", () => {
      const error = new Error("test error");
      const result: Result<string, Error> = Result.err(error);
      const defaultValue = "fallback";
      const unwrappedValue = result.unwrapOr(defaultValue);
      expect(unwrappedValue).toEqual(defaultValue);
    });

    it("should return the value from an Ok result", () => {
      const value = "data";
      const result = Result.ok(value);
      const defaultValueFn = () => "default"; // Default value function not called
      const unwrappedValue = result.unwrapOrElse(defaultValueFn);
      expect(unwrappedValue).toEqual(value);
    });

    it("should return the value from the default value function if the result is Err", () => {
      const error = new Error("test error");
      const result: Result<string, Error> = Result.err(error);
      const defaultValueFn = () => "fallback";
      const unwrappedValue = result.unwrapOrElse(defaultValueFn);
      expect(unwrappedValue).toEqual(defaultValueFn()); // Default value function called
    });

    it("should call a function for the default value with unwrapOrElse", () => {
      const result: Result<string, Error> = Result.err(new Error("error"));
      const getDefaultValue = jest.fn(() => "default value");
      expect(result.unwrapOrElse(getDefaultValue)).toBe("default value");
      expect(getDefaultValue).toHaveBeenCalledTimes(1);
    });

    it("should access the value from an Ok result with unwrap", () => {
      const result = Result.ok("data");
      expect(result.unwrap()).toBe("data");
    });

    it("should throw an error if the result is Ok", () => {
      const result = Result.ok("data");
      const message = "Expected an error";
      expect(() => result.expectErr(message)).toThrow();
    });

    it("should return the error value if the result is Err", () => {
      const error = new Error("error");
      const result = Result.err(error);
      const expectedError = result.expectErr("should return the error");
      expect(expectedError).toBe(error);
    });

    it("should check if Ok and the value satisfies a predicate with isOkAnd", () => {
      const result = Result.ok(42);
      expect(result.isOkAnd((value) => value === 42)).toBe(true);
    });

    it("should return false for isOkAnd with Ok and non-matching predicate", () => {
      const result = Result.ok(42);
      expect(result.isOkAnd((value) => value > 100)).toBe(false);
    });

    it("should always return false with isErrAnd", () => {
      const okResult = Result.ok("data");
      const errResult = Result.err(new Error("error"));

      expect(okResult.isErrAnd(() => true)).toBe(false);
      expect(errResult.isErrAnd(() => true)).toBe(true);
    });

    it("should match Ok with a predicate using isOkAnd", () => {
      const result = Result.ok(42);
      expect(result.isOkAnd((value) => value === 42)).toBeTruthy();
    });
  });

  describe("Transforming values", () => {
    it("should apply a function to Ok and return a new Result (map)", () => {
      const result = Result.ok(42).map((value) => value * 2);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(84);
    });

    it("should provide a default value with mapOr", () => {
      const result: Result<string, Error> = Result.err(new Error("error"));
      const defaultValue = "default value";
      const mappedResult = result.mapOr(defaultValue, (value) =>
        value.toUpperCase()
      );
      expect(mappedResult).toBe(defaultValue);
    });

    it("should apply a function to the value and return Ok with mapOr for Ok", () => {
      const result = Result.ok("data");
      const mappedResult = result.mapOr("default", (value) =>
        value.toUpperCase()
      );
      expect(mappedResult).toBe("DATA");
    });

    it("should call a function for the default value with mapOrElse", () => {
      const result: Result<string, Error> = Result.err(new Error("error"));
      const getDefaultValue = jest.fn(() => "default value");
      const mappedResult = result.mapOrElse(getDefaultValue, (value) =>
        value.toUpperCase()
      );
      expect(mappedResult).toBe("default value");
      expect(getDefaultValue).toHaveBeenCalledTimes(1);
    });

    it("should apply a function to the value and return Ok with mapOrElse for Ok", () => {
      const result = Result.ok("data");
      const mapFunction = jest.fn((value) => value.toUpperCase());
      const mappedResult = result.mapOrElse(() => "default", mapFunction);
      expect(mappedResult).toBe("DATA");
      expect(mapFunction).toHaveBeenCalledTimes(1);
      expect(mapFunction).toHaveBeenCalledWith("data");
    });

    it("should return Err with map for Err", () => {
      const error = new Error("error");
      const result = Result.err<Error, string>(error).map((value) =>
        value.toUpperCase()
      );
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(error);
      expect(() => result.unwrap()).toThrow();
    });

    it("should apply a function to the error and return Err with mapErr", () => {
      const error = new Error("Original error");
      const mappedError = "Mapped error";
      const result = Result.err(error);
      const mappedResult = result.mapErr((err) => mappedError);
      expect(mappedResult.isErr()).toBe(true);
      expect(mappedResult.unwrapErr()).toBe(mappedError);
    });

    it("should leave Ok result unchanged with mapErr", () => {
      const value = "data";
      const result = Result.ok(value);
      const mappedResult = result.mapErr((err) => "error");
      expect(mappedResult.isOk()).toBe(true);
      expect(mappedResult.unwrap()).toBe(value);
    });
  });

  describe("Handling potential errors (tryFrom, tryFromNullable)", () => {
    it("should create Ok from a valid value with tryFrom", () => {
      const result = Result.tryFrom(
        () => JSON.parse("42"),
        new Error("should not happen")
      );
      expect(result.isOk()).toBeTruthy();
      expect(result.unwrap()).toBe(42);
    });

    it("should create Err from an error with tryFrom", () => {
      const expectedError = new Error("should happen");
      const result = Result.tryFrom(() => JSON.parse("invalid"), expectedError);
      expect(result.isErr()).toBeTruthy();
      expect(result.unwrapErr()).toBe(expectedError);
    });

    it("should create Ok from a non-null value with tryFromNullable", () => {
      const result = Result.tryFromNullable(
        () => 42,
        new Error("should not happen")
      );
      expect(result.isOk()).toBeTruthy();
      expect(result.unwrap()).toBe(42);
    });

    it("should create Err from a null value with tryFromNullable", () => {
      const expectedError = new Error("should happen");
      const result = Result.tryFromNullable(() => null, expectedError);
      expect(result.isErr()).toBeTruthy();
      expect(result.unwrapErr()).toBe(expectedError);
    });

    it("should return Ok with the function return value if it is not null or undefined", () => {
      const error = "never happens";
      const value = "data";
      const fn = () => value;
      const result = Result.tryFromNullable(fn, error);
      expect(result).toEqual(Result.ok(value));
    });

    it("should return Err with the provided error if the function throws an error", () => {
      const error = new Error("test error");
      const fn = () => {
        throw error;
      };
      const result = Result.tryFromNullable(fn, error);
      expect(result).toEqual(Result.err(error));
    });

    it("should return Err with the provided error if the function returns null", () => {
      const error = "null value error";
      const fn = () => null;
      const result = Result.tryFromNullable(fn, error);
      expect(result).toEqual(Result.err(error));
    });

    it("should return Err with the provided error if the function returns undefined", () => {
      const error = "undefined value error";
      const fn = () => undefined;
      const result = Result.tryFromNullable(fn, error);
      expect(result).toEqual(Result.err(error));
    });
  });

  describe("Matching Variants (match)", () => {
    it("should call the ok matcher function with the value", () => {
      const result: Result<number, Error> = Result.ok(42);
      const matcher = {
        ok: (value: number) => (value * 2).toString(),
        err: (error: Error) => "Error handling",
      };
      const matchedValue = result.match(matcher);
      expect(matchedValue).toBe("84");
    });

    it("should call the err matcher function with the error", () => {
      const error = new Error("error");
      const result: Result<string, Error> = Result.err(error);
      const matcher = {
        ok: (value: string) => "Value handling",
        err: (error: Error) => error.message,
      };
      const matchedValue = result.match(matcher);
      expect(matchedValue).toBe("error");
    });

    it("should throw an error if matcher object is missing ok or err functions", () => {
      const result: Result<string, Error> = Result.ok("data");
      const invalidMatcher = {} as ResultPattern<string, Error, string>;
      expect(() => result.match(invalidMatcher)).toThrow();
    });
  });

  describe("Chaining Operations (and, andThen)", () => {
    it("and: should return the second result if the first is Ok", () => {
      const firstResult = Result.ok("data1");
      const secondResult = Result.ok("data2");
      const chainedResult = firstResult.and(secondResult);
      expect(chainedResult).toEqual(secondResult);
    });

    it("and: should propagate the error from the first result if it is Err", () => {
      const error = new Error("error");
      const firstResult = Result.err(error);
      const secondResult = Result.ok("data2");
      const chainedResult = firstResult.and(secondResult);
      expect(chainedResult).toEqual(firstResult);
    });

    it("andThen: should apply the mapper function and return the result if the first result is Ok", () => {
      const value = 42;
      const firstResult = Result.ok(value);
      const mapper = (val: number) => Result.ok(val * 2);
      const chainedResult = firstResult.andThen(mapper);
      expect(chainedResult).toEqual(Result.ok(value * 2));
    });

    it("andThen: should propagate the error from the first result if it is Err", () => {
      const error = new Error("error");
      const firstResult = Result.err(error);
      const mapper = (val: number) => Result.ok(val * 2);
      const chainedResult = firstResult.andThen(mapper);
      expect(chainedResult).toEqual(firstResult);
    });

    it("andThen: should propagate the error from the mapper function if the first result is Ok", () => {
      const value = 42;
      const firstResult: Result<number, Error> = Result.ok(value);
      const mapper = (val: number) => Result.err(new Error("mapping error"));
      const chainedResult = firstResult.andThen(mapper);
      expect(chainedResult).toEqual(Result.err(new Error("mapping error")));
    });
  });

  describe("Transformations (flatMap)", () => {
    it("should apply the mapper function and return a new Result based on the transformation if the first result is Ok", () => {
      const value = 42;
      const firstResult = Result.ok(value);
      const mapper = (val: number) => Result.ok(val * 2);
      const chainedResult = firstResult.flatMap(mapper);
      expect(chainedResult).toEqual(Result.ok(value * 2));
    });

    it("should propagate the error from the first result if it is Err", () => {
      const error = new Error("error");
      const firstResult = Result.err(error);
      const mapper = (val: number) => Result.ok(val * 2);
      const chainedResult = firstResult.flatMap(mapper);
      expect(chainedResult).toEqual(firstResult);
    });

    it("should propagate the error from the mapper function if the first result is Ok", () => {
      const value = 42;
      const firstResult: Result<number, Error> = Result.ok(value);
      const mapper = (val: number) => Result.err(new Error("mapping error"));
      const chainedResult = firstResult.flatMap(mapper);
      expect(chainedResult).toEqual(Result.err(new Error("mapping error")));
    });
  });

  describe("Nested Results (flatten)", () => {
    it("should flatten a nested Result", () => {
      const nestedValue = 42;
      const nestedResult = Result.ok(nestedValue);
      const outerResult = Result.ok(nestedResult);
      const flattenedResult = outerResult.flatten();
      expect(flattenedResult).toEqual(Result.ok(nestedValue));
    });

    it("should return the original Result if it is not nested", () => {
      const value = "data";
      const result = Result.ok(value);
      const flattenedResult = result.flatten();
      expect(flattenedResult).toEqual(result);
    });
  });

  describe("Combining Results (or, orElse)", () => {
    it("or: should return the first result if it is Ok", () => {
      const firstResult = Result.ok("data1");
      const secondResult = Result.ok("data2");
      const combinedResult = firstResult.or(secondResult);
      expect(combinedResult).toEqual(firstResult);
    });

    it("or: should return the second result if the first result is Err", () => {
      const error = new Error("error1");
      const firstResult: Result<string, Error> = Result.err(error);
      const secondResult: Result<string, Error> = Result.ok("data2");
      const combinedResult = firstResult.or(secondResult);
      expect(combinedResult).toEqual(secondResult);
    });

    it("orElse: should return the result of the mapper function if the first result is Err", () => {
      const error = new Error("error");
      const firstResult: Result<string, Error> = Result.err(error);
      const mapper = (err: Error) => Result.ok("fallback");
      const combinedResult = firstResult.orElse(mapper);
      expect(combinedResult).toEqual(Result.ok("fallback"));
    });

    it("orElse: should return the first result if it is Ok", () => {
      const value = "data";
      const firstResult: Result<string, Error> = Result.ok(value);
      const mapper = (err: Error) => Result.ok<string, Error>("fallback");
      const combinedResult = firstResult.orElse(mapper);
      expect(combinedResult).toEqual(firstResult);
    });

    it("orElse: should not call the mapper function if the first result is Ok", () => {
      const value = "data";
      const firstResult: Result<string, Error> = Result.ok(value);
      const mapper = jest.fn((err: Error) => Result.ok("fallback")); // Mock function to check if called
      const combinedResult = firstResult.orElse(mapper);
      expect(combinedResult).toEqual(firstResult);
      expect(mapper).not.toHaveBeenCalled(); // Verify mapper is not called
    });
  });

  describe("String Representation (toString)", () => {
    it('should return a string like "Ok(value)" if the result is Ok', () => {
      const value = "data";
      const result = Result.ok(value);
      const stringRepresentation = result.toString();
      expect(stringRepresentation).toEqual(`Ok(${value})`);
    });

    it('should return a string like "Err(error)" if the result is Err', () => {
      const error = new Error("error");
      const result = Result.err(error);
      const stringRepresentation = result.toString();
      expect(stringRepresentation).toEqual(`Err(${error})`);
    });
  });
});
