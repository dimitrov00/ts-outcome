import { panic } from "../helpers";

export enum ResultKind {
  Ok,
  Err,
}

export type ResultPattern<T, E, U> = {
  ok: (value: T) => U;
  err: (error: E) => U;
};

export const ok = <T, E = never>(value: T): Result<T, E> => Result.ok(value);
export const err = <E, T = never>(error: E): Result<T, E> => Result.err(error);

/**
 * Represents the result of an operation that can either be successful (Ok) or unsuccessful (Err).
 *
 * This class provides methods for handling and manipulating these results in a safe and structured way.
 */
export class Result<T, E> {
  private constructor(
    private readonly __kind: ResultKind,
    private readonly data: T | E
  ) {}

  /**
   * Creates a `Result<T, E>` object indicating a successful outcome with a provided value.
   *
   * @param value The successful value of type `T`.
   * @returns A `Result<T, E>` object encapsulating the successful value.
   */
  public static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(ResultKind.Ok, value);
  }

  /**
   * Creates a `Result<T, E>` object indicating an error outcome with a specific error message or value.
   *
   * @param error The error message or value of type `E`.
   * @returns A `Result<T, E>` object encapsulating the error information.
   */
  public static err<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>(ResultKind.Err, error);
  }

  /**
   * Attempts to execute a function and returns a `Result` object.
   * If the function throws an error, it returns an `Err` with the provided error value.
   * Otherwise, it returns an `Ok` with the function's return value.
   *
   * @param fn A function that potentially throws an error.
   * @param error The error value to use in case of an exception. (Default: never)
   * @returns A `Result<T, E>` object.
   */
  public static tryFrom<T, E = never>(fn: () => T, error: E): Result<T, E> {
    try {
      return Result.ok(fn());
    } catch (e) {
      return Result.err(error);
    }
  }

  /**
   * Creates a `Result` object based on a value.
   * If the value is null or undefined, it returns an `Err` with the provided error value.
   * Otherwise, it returns an `Ok` with the value.
   *
   * @param value The value to check.
   * @param error The error value to use if the value is null or undefined. (Default: never)
   * @returns A `Result<T, E>` object.
   */
  public static fromNullable<T, E = never>(
    value: T | null | undefined,
    error: E
  ): Result<T, E> {
    return value === null || value === undefined
      ? Result.err(error)
      : Result.ok(value);
  }

  /**
   * Attempts to execute a function that returns a nullable value and returns a `Result` object.
   * If the function throws an error or the return value is null/undefined, it returns an `Err` with the provided error value.
   * Otherwise, it returns an `Ok` with the function's return value.
   *
   * @param fn A function that potentially throws an error and returns a nullable value.
   * @param error The error value to use in case of an exception or a null/undefined return value. (Default: never)
   * @returns A `Result<T, E>` object.
   */
  public static tryFromNullable<T, E = never>(
    fn: () => T | null | undefined,
    error: E
  ): Result<T, E> {
    try {
      return Result.fromNullable(fn(), error);
    } catch (e) {
      return Result.err(error);
    }
  }

  /**
   * Checks if the `Result` object is an `Ok` variant (successful outcome).
   *
   * @returns true if it's an `Ok`, false otherwise.
   */
  public isOk(): boolean {
    return this.__kind === ResultKind.Ok;
  }

  /**
   * Checks if the `Result` object is an `Ok` and the value satisfies a predicate function.
   *
   * @param predicate A function that takes the value from an `Ok` result and returns true if it passes the condition.
   * @returns true if it's an `Ok` and the predicate passes, false otherwise.
   */
  public isOkAnd(predicate: (value: T) => boolean): boolean {
    return this.isOk() && predicate(this.data as T);
  }

  /**
   * Checks if the `Result` object is an `Err` variant (error outcome).
   *
   * @returns true if it's an `Err`, false otherwise.
   */
  public isErr(): boolean {
    return this.__kind === ResultKind.Err;
  }

  /**
   * Checks if the `Result` object is an `Err` and the error value satisfies a predicate function.
   *
   * @param predicate A function that takes the error value from an `Err` result and returns true if it passes the condition.
   * @returns true if it's an `Err` and the predicate passes, false otherwise.
   */
  public isErrAnd(predicate: (error: E) => boolean): boolean {
    return this.isErr() && predicate(this.data as E);
  }

  /**
   * Applies a function (`mapper`) to the value from an `Ok` result and returns a new `Result`.
   * If the original result is an `Err`, it's left unchanged.
   *
   * @param mapper A function that takes the value from an `Ok` result and returns a new value.
   * @returns A new `Result<U, E>`.
   */
  public map<U>(mapper: (value: T) => U): Result<U, E> {
    return this.isOk()
      ? Result.ok(mapper(this.data as T))
      : Result.err(this.data as E);
  }

  /**
   * Similar to `map`, but provides a default value if the result is an `Err`.
   *
   * @param defaultValue The value to return if the result is an `Err`.
   * @param mapper A function that takes the value from an `Ok` result and returns a new value.
   * @returns The mapped value from an `Ok` result or the `defaultValue`.
   */
  public mapOr<U>(defaultValue: U, mapper: (value: T) => U): U {
    return this.isOk() ? mapper(this.data as T) : defaultValue;
  }

  /**
   * Similar to `mapOr`, but allows providing a function to generate the default value.
   *
   * @param defaultValue A function that returns the default value if the result is an `Err`.
   * @param mapper A function that takes the value from an `Ok` result and returns a new value.
   * @returns The mapped value from an `Ok` result or the value returned by the `defaultValue` function.
   */
  public mapOrElse<U>(defaultValue: () => U, mapper: (value: T) => U): U {
    return this.isOk() ? mapper(this.data as T) : defaultValue();
  }

  /**
   * Applies a function (`mapper`) to the error value from an `Err` result and returns a new `Result`.
   * If the original result is an `Ok`, it's left unchanged.
   *
   * @param mapper A function that takes the error value from an `Err` result and returns a new error value.
   * @returns A new `Result<T, F>`.
   */
  public mapErr<F>(mapper: (error: E) => F): Result<T, F> {
    return this.isErr()
      ? Result.err(mapper(this.data as E))
      : Result.ok(this.data as T);
  }

  /**
   * Applies a matcher function based on the result's kind (Ok or Err).
   *
   * The matcher object provides functions for handling both `Ok` and `Err` cases.
   * The function for the `Ok` variant receives the contained value, while the function
   * for the `Err` variant receives the error value.
   *
   * @param matcher An object with two properties:
   *  * `ok`: A function that takes the value from a `Result.ok` and returns a value of type `U`.
   *  * `err`: A function that takes the error from a `Result.err` and returns a value of type `U`.
   * @returns The result of applying the appropriate function from the matcher object based on the result's kind.
   */
  public match<U>(matcher: ResultPattern<T, E, U>): U {
    return this.isOk()
      ? matcher.ok(this.data as T)
      : matcher.err(this.data as E);
  }

  /**
   * Returns the value from an `Ok` result. Panics with a custom message if it's an `Err`.
   *
   * @param message The message to display if the result is an `Err`.
   * @throws Panics if the result is an `Err`.
   * @returns The value from the `Ok` result.
   */
  public expect(message: string): T {
    if (this.isErr()) {
      panic(message);
    }

    return this.data as T;
  }

  /**
   * Returns the value from an `Ok` result, panicking with a default message if it's an `Err`.
   *
   * @throws Panics with a default message if the result is an `Err`.
   * @returns The value from the `Ok` result.
   */
  public unwrap(): T {
    return this.expect("called `Result.unwrap()` on an `Err` value");
  }

  /**
   * Returns the error value from an `Err` result. Panics with a custom message if it's an `Ok`.
   *
   * @param message The message to display if the result is an `Ok`.
   * @throws Panics if the result is an `Ok`.
   * @returns The error value from the `Err` result.
   */
  public expectErr(message: string): E {
    if (this.isOk()) {
      panic(message);
    }

    return this.data as E;
  }

  /**
   * Returns the error value from an `Err` result, panicking with a default message if it's an `Ok`.
   *
   * @throws Panics with a default message if the result is an `Ok`.
   * @returns The error value from the `Err` result.
   */
  public unwrapErr(): E {
    return this.expectErr("called `Result.unwrapErr()` on an `Ok` value");
  }

  /**
   * Returns the value from an `Ok` result or a default value if it's an `Err`.
   *
   * @param defaultValue The value to return if the result is an `Err`.
   * @returns The value from the `Ok` result or the `defaultValue`.
   */
  public unwrapOr(defaultValue: T): T {
    return this.isOk() ? (this.data as T) : defaultValue;
  }

  /**
   * Returns the value from an `Ok` result or the value returned by a function if it's an `Err`.
   *
   * @param defaultValue A function that returns the default value if the result is an `Err`.
   * @returns The value from the `Ok` result or the value returned by the `defaultValue` function.
   */
  public unwrapOrElse(defaultValue: () => T): T {
    return this.isOk() ? (this.data as T) : defaultValue();
  }

  /**
   * Chains two `Result` objects, returning the second result if the first is `Ok`, otherwise propagating the first error.
   *
   * @param other The second `Result` to chain.
   * @returns A new `Result<U, E>`.
   */
  public and<U>(other: Result<U, E>): Result<U, E> {
    return this.isOk() ? other : Result.err(this.data as E);
  }

  /**
   * Maps a function over the value of an `Ok` result, chaining the result of the function.
   * If the initial result or the function's result is an `Err`, it propagates the first error.
   *
   * @param mapper A function that takes the value from an `Ok` result and returns a new `Result`.
   * @returns A new `Result<U, E>`.
   */
  public andThen<U>(mapper: (value: T) => Result<U, E>): Result<U, E> {
    return this.isOk() ? mapper(this.data as T) : Result.err(this.data as E);
  }

  /**
   * Applies a function to the contained value of a successful `Result`, returning a new `Result`.
   * This method performs a transformation on the value of the `Result` instance, but only if the instance is `Ok`. If the instance is `Err`, it propagates the error directly, returning a new `Result` with the same error type (`E`).
   * 
   * @param mapper A function that takes the value from an `Ok` `Result` and returns a new `Result<U, E>`. This function can be used to transform the value into a new type `U` or perform additional logic based on the success or failure of the original `Result`.
   * @returns A new `Result<U, E>`.
   *  - If the original `Result` was `Ok`, the returned `Result` will contain the result of applying the `mapper` function to the value. This result can be of type `U`.
   *  - If the original `Result` was `Err`, the returned `Result` will be a new `Err` instance with the same error type (`E`) and the original error value.
   * @example
   ```typescript
    const successfulResult = Result.ok(42);
    const maybeMapped = successfulResult.flatMap(value => Result.ok(value * 2)); // Result.ok(84) (result type: number)

    const errorResult = Result.err('Something went wrong');
    const stillErr = errorResult.flatMap(value => Result.ok(value * 2)); // Result.err('Something went wrong') (result type: never)
    ```
  */
  public flatMap<U>(mapper: (value: T) => Result<U, E>): Result<U, E> {
    return this.isOk() ? mapper(this.data as T) : Result.err(this.data as E);
  }

  /**
   * Combines two `Result` objects, returning the first result if it's `Ok`, otherwise returning the second result.
   *
   * @param other The second `Result` to combine.
   * @returns A new `Result<T, F>`.
   */
  public or<F>(other: Result<T, F>): Result<T, F> {
    return this.isErr() ? other : Result.ok(this.data as T);
  }

  /**
   * Maps a function over the error of an `Err` result, chaining the result of the function.
   * If the initial result is `Ok` or the function's result is an `Err`, it returns the initial `Ok` value.
   *
   * @param mapper A function that takes the error from an `Err` result and returns a new `Result`.
   * @returns A new `Result<T, F>`.
   */
  public orElse<F>(mapper: (error: E) => Result<T, F>): Result<T, F> {
    return this.isErr() ? mapper(this.data as E) : Result.ok(this.data as T);
  }

  /**
   * Attempts to flatten a nested `Result<T, E>` structure.
   *
   * This method checks if the `data` property of the current `Result` instance holds another `Result` object.
   * If it does, it recursively calls `flatten` on the nested `Result` to achieve a flat structure.
   * Otherwise, it returns the current `Result` instance unchanged.
   *
   * @returns A new `Result<T, E>` with the nested structure flattened (if applicable), or the current `Result` if it's not nested.
   */
  public flatten(): Result<T, E> {
    if (this.data instanceof Result) {
      // Type guard for nested Result
      return (this.data as Result<T, E>).flatten(); // Recursive call for nested flattening
    } else {
      return this; // Not a nested Result, so return itself
    }
  }

  /**
   * Converts the `Result` object to a human-readable string representation.
   *
   * - If the result is an `Ok`, it returns a string like `"Ok(value)"` where `value` is the held value.
   * - If the result is an `Err`, it returns a string like `"Err(error)"` where `error` is the error value.
   *
   * @returns A string representation of the `Result` object.
   */
  public toString(): string {
    return this.isOk() ? `Ok(${this.data})` : `Err(${this.data})`;
  }
}
