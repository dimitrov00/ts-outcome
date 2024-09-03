import { Option, OptionPattern } from "./option";

import { Result } from "./result";

describe("Option", () => {
  describe("Creation and basic checks", () => {
    const expectedData = "test";

    it("should create Some(value)", () => {
      const someOption = Option.some(expectedData);
      expect(someOption.isSome()).toBeTruthy();
      expect(someOption.unwrap()).toBe(expectedData);
    });

    it("should create None", () => {
      const noneOption = Option.none;
      expect(noneOption.isNone()).toBeTruthy();
      expect(noneOption.isSome()).toBeFalsy();
    });

    it("should create Some from a non-null value", () => {
      const someOption = Option.fromNullable(expectedData);
      expect(someOption.isSome()).toBeTruthy();
      expect(someOption.unwrap()).toBe(expectedData);
    });

    it("should create None from a null or undefined value", () => {
      const noneOption1 = Option.fromNullable(null);
      const noneOption2 = Option.fromNullable(undefined);
      expect(noneOption1.isNone()).toBeTruthy();
      expect(noneOption2.isNone()).toBeTruthy();
    });
  });

  describe("Handling Some and None Variants (isSome, isSomeAnd, isNone, unwrap, unwrapOr, unwrapOrElse)", () => {
    const expectedData = "test";
    const someOption: Option<string> = Option.some(expectedData);
    const noneOption: Option<string> = Option.none;

    it("should check for Some and None variants (isSome, isNone)", () => {
      expect(someOption.isSome()).toBeTruthy();
      expect(someOption.isNone()).toBeFalsy();

      expect(noneOption.isSome()).toBeFalsy();
      expect(noneOption.isNone()).toBeTruthy();
    });

    it("should unwrap a Some value", () => {
      expect(someOption.unwrap()).toBe(expectedData);
    });

    it("should panic on unwrap with None", () => {
      expect(() => noneOption.unwrap()).toThrow(
        "called `Option.unwrap()` on a `None` value"
      );
    });

    it("should provide a default value with unwrapOr", () => {
      const expectedDefault = "data";
      expect(someOption.unwrapOr(expectedDefault)).toBe(expectedData);
      expect(noneOption.unwrapOr(expectedDefault)).toBe(expectedDefault);
    });

    it("should call a function for the default value with unwrapOrElse", () => {
      const expectedDefault = "data";
      const defaultValueFunction = jest.fn(() => expectedDefault);

      someOption.unwrapOrElse(defaultValueFunction);
      expect(defaultValueFunction).not.toHaveBeenCalled();

      noneOption.unwrapOrElse(defaultValueFunction);
      expect(defaultValueFunction).toHaveBeenCalledTimes(1);
      expect(noneOption.unwrapOrElse(defaultValueFunction)).toBe(
        expectedDefault
      );
    });

    it("should check if Some and the value satisfies a predicate with isSomeAnd", () => {
      const containsNumber = (value: string) => /\d/.test(value);
      expect(someOption.isSomeAnd(containsNumber)).toBeFalsy();
      expect(Option.some("test40").isSomeAnd(containsNumber)).toBeTruthy();
    });
  });

  describe("Transforming Values (map, mapOr, mapOrElse)", () => {
    const initialData = 42;
    const transformingFactor = 2;
    
    const someOption: Option<number> = Option.some(initialData);
    const noneOption: Option<number> = Option.none;
    const transformingFn = (value: number) => value * transformingFactor;

    it("should apply a function to Some and return a new Option", () => {
      const doubledOption = someOption.map(transformingFn);
      expect(doubledOption.isSome()).toBeTruthy();
      expect(doubledOption.unwrap()).toBe(initialData * transformingFactor);
    });

    it("should return None with map for None", () => {
      const mappedNoneOption = noneOption.map(transformingFn);
      expect(mappedNoneOption.isNone()).toBeTruthy();
    });

    it("should provide a default value with mapOr", () => {
      const expectedDefault = 10;
      const mappedSome = someOption.mapOr(expectedDefault, transformingFn);
      expect(mappedSome).toBe(84);

      const mappedNone = noneOption.mapOr(expectedDefault, transformingFn); // any function for None
      expect(mappedNone).toBe(expectedDefault);
    });

    it("should call a function for the default value with mapOrElse", () => {
      const expectedDefault = 10;
      const defaultValueFunction = jest.fn(() => expectedDefault);

      someOption.mapOrElse(defaultValueFunction, transformingFn);
      expect(defaultValueFunction).not.toHaveBeenCalled();

      noneOption.mapOrElse(defaultValueFunction, transformingFn); // any function for None
      expect(defaultValueFunction).toHaveBeenCalledTimes(1);
      expect(noneOption.mapOrElse(defaultValueFunction, transformingFn)).toBe(
        expectedDefault
      );
    });
  });

  describe("Handling Potential Errors (tryFrom, tryFromNullable)", () => {
    it("should create Some with tryFrom when the function succeeds", () => {
      const successfulValue = 42;
      const successfulOption = Option.tryFrom(() => successfulValue);
      expect(successfulOption.isSome()).toBeTruthy();
      expect(successfulOption.unwrap()).toBe(successfulValue);
    });

    it("should create None with tryFrom when the function throws an error", () => {
      const erroringFn = () => {
        throw new Error("Test error");
      };

      const erroringOption = Option.tryFrom(erroringFn);
      expect(erroringOption.isNone()).toBeTruthy();
    });

    it("should create Some with tryFromNullable when the function returns a value", () => {
      const nullableValue = "hello";
      const someOption = Option.tryFromNullable(() => nullableValue);
      expect(someOption.isSome()).toBeTruthy();
      expect(someOption.unwrap()).toBe(nullableValue);
    });

    it("should create None with tryFromNullable when the function returns null", () => {
      const nullOption = Option.tryFromNullable(() => null);
      expect(nullOption.isNone()).toBeTruthy();
    });

    it("should create None with tryFromNullable when the function throws an error", () => {
      const erroringFn = () => {
        throw new Error("Test error");
      };

      const erroringOption = Option.tryFromNullable(erroringFn);
      expect(erroringOption.isNone()).toBeTruthy();
    });
  });

  describe("Conversions to Result (okOr, okOrElse)", () => {
    const expectedData = 42;
    const someOption: Option<number> = Option.some(expectedData);
    const noneOption: Option<number> = Option.none;
    const expectedError = "test error";
    const expectedOkResult = Result.ok(expectedData);
    const expectedErrResult = Result.err(expectedError);

    it("should convert Some(value) to Ok(value) with okOr", () => {
      expect(someOption.okOr("error")).toEqual(expectedOkResult);
    });

    it("should convert None to Err(error) with okOr", () => {
      expect(noneOption.okOr(expectedError)).toEqual(expectedErrResult);
    });

    it("should convert Some(value) to Ok(value) with okOrElse", () => {
      expect(someOption.okOrElse(() => "error")).toEqual(expectedOkResult);
    });

    it("should call the error function and convert None to Err(error) with okOrElse", () => {
      const noneOption = Option.none;
      const errorFunction = jest.fn(() => expectedError);
      expect(noneOption.okOrElse(errorFunction)).toEqual(expectedErrResult);
      expect(errorFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe("Matching Variants (match)", () => {
    const expectedData = 42;
    const someOption = Option.some(expectedData);
    const noneOption = Option.none;

    it("should throw an error if the matcher object is missing Some or None functions", () => {
      const invalidMatcher1 = {} as OptionPattern<number, string>; // Missing Some function
      const invalidMatcher2 = { none: () => "default" } as OptionPattern<number, string>; // Missing Some function

      expect(() => someOption.match(invalidMatcher1)).toThrow();
      expect(() => someOption.match(invalidMatcher2)).toThrow();
    });

    it("should call the Some matcher function with the value", () => {
      const matcher: OptionPattern<number, string> = {
        some: jest.fn((value) => value.toString()),
        none: jest.fn(() => "default"),
      };
      
      someOption.match(matcher);
      expect(matcher.some).toHaveBeenCalledWith(expectedData);
    });

    it("should call the None matcher function without arguments", () => {
      const matcher: OptionPattern<number, string> = {
        some: jest.fn((value) => value.toString()),
        none: jest.fn(() => "default"),
      };
      noneOption.match(matcher);
      expect(matcher.none).toHaveBeenCalledTimes(1);
      expect(matcher.none).toHaveBeenCalledWith(); // No arguments for None
      expect(matcher.some).not.toHaveBeenCalled();
    });

    it("should return the result of the called matcher function", () => {
      const result = someOption.match({ some: (value) => value.toString(), none: () => "default" });
      expect(result).toBe(expectedData.toString());
    });
  });

  describe("Chaining Operations (and, andThen)", () => {
    const initialData = 42;
    const someOption = Option.some(initialData);
    const noneOption = Option.none;

    it("should propagate None from the first option with and", () => {
      expect(noneOption.and(someOption)).toBe(Option.none);
      expect(someOption.and(noneOption)).toBe(Option.none);
    });

    it("should return the second option with and for Some", () => {
      const otherOption = Option.some("hello");
      expect(someOption.and(otherOption)).toBe(otherOption);
    });

    it("should propagate None from the first option with andThen", () => {
      const mapper = (value: number) => Option.some(value * 2);
      expect(noneOption.andThen(mapper)).toBe(Option.none);
    });

    it("should apply the mapper and return the result with andThen for Some", () => {
      const mapper = (value: number) => Option.some(value * 2);
      expect(someOption.andThen(mapper)).toEqual(Option.some(initialData * 2));
    });
  });

  describe("Transformations (flatMap, filter)", () => {
    const someOption = Option.some(42);
    const noneOption = Option.none;

    it("should call the mapper and return the result for flatMap with Some", () => {
      const mapper = jest.fn((value: number) => Option.some(value * 2));
      someOption.flatMap(mapper);
      expect(mapper).toHaveBeenCalledWith(42);
      expect(someOption.flatMap(mapper)).toEqual(Option.some(84));
    });

    it("should return None for flatMap with None", () => {
      expect(noneOption.flatMap((value) => Option.some(value * 2))).toBe(Option.none);
    });

    it("should return the option itself for filter with Some and passing predicate", () => {
      const predicate = (value: number) => value > 40;
      expect(someOption.filter(predicate)).toBe(someOption);
    });

    it("should return None for filter with Some and failing predicate", () => {
      const predicate = (value: number) => value < 40;
      expect(someOption.filter(predicate)).toBe(Option.none);
    });

    it("should return None for filter with None", () => {
      expect(noneOption.filter((value) => true)).toBe(Option.none);
    });
  });

  describe("Combining Options (or, orElse)", () => {
    const someOption: Option<number | string> = Option.some(42);
    const noneOption: Option<number | string> = Option.none;
    const otherOption: Option<number | string> = Option.some("hello");

    it("should return the first option for or with Some", () => {
      expect(someOption.or(otherOption)).toBe(someOption);
    });

    it("should return the second option for or with None", () => {
      expect(noneOption.or(otherOption)).toBe(otherOption);
    });

    it("should return the first option for orElse with Some", () => {
      expect(someOption.orElse(() => Option.some("default"))).toBe(someOption);
    });

    it("should call the mapper and return the result for orElse with None", () => {
      const defaultOption = Option.some("default");
      const mapper = jest.fn(() => defaultOption);
      noneOption.orElse(mapper);
      expect(mapper).toHaveBeenCalledTimes(1);
      expect(noneOption.orElse(mapper)).toBe(defaultOption);
    });
  });

  describe("Nested Options (flatten)", () => {
    const someOption = Option.some(42);
    const someNestedOption = Option.some(someOption);
    const noneOption = Option.none;

    it("should flatten nested options with flatten", () => {
      expect(someNestedOption.flatten()).toBe(someOption);
    });

    it("should return itself for flatten with non-nested Option", () => {
      expect(someOption.flatten()).toBe(someOption);
    });

    it("should return None for flatten with None", () => {
      expect(noneOption.flatten()).toBe(Option.none);
    });
  });

  describe("String Representation (toString)", () => {
    const someOption = Option.some(42);
    const noneOption = Option.none;

    it("should return Some(value) for toString with Some", () => {
      expect(someOption.toString()).toBe("Some(42)");
    });

    it("should return None for toString with None", () => {
      expect(noneOption.toString()).toBe("None");
    });
  });
});
