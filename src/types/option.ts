import { Result } from "./result";
import { panic } from "../helpers";

export enum OptionKind {
  Some,
  None,
}

export type OptionPattern<T, U> = {
  some: (value: T) => U;
  none: () => U;
};

export const some = <T>(value: T): Option<T> => Option.some(value);
export const none = <T>(): Option<T> => Option.none;

/**
 * Represents an optional value that may or may not exist.
 *
 * The `Option` class provides a safe way to handle the absence of values
 * and avoid potential runtime errors associated with null or undefined checks.
 */
export class Option<T> {
  private constructor(
    private readonly __kind: OptionKind,
    private readonly data?: T
  ) {}

  /**
   * An immutable `Option` representing the absence of a value.
   */
  public static none: Option<never> = new Option(OptionKind.None);

  /**
   * Creates an `Option` containing a specified value.
   *
   * @param value The value to hold within the `Option`.
   * @returns An `Option<T>` containing the provided value.
   */
  public static some<T>(value: T): Option<T> {
    return new Option(OptionKind.Some, value);
  }

  /**
   * Attempts to execute a function and wraps the result in an `Option`.
   * If the function throws an error, it returns `Option.none`.
   *
   * @param fn A function that potentially throws an error.
   * @returns An `Option<T>` containing the function's return value if successful, otherwise `Option.none`.
   */
  public static tryFrom<T>(fn: () => T): Option<T> {
    try {
      return Option.some(fn());
    } catch (e) {
      return Option.none;
    }
  }

  /**
   * Creates an `Option` based on a value.
   * If the value is null or undefined, it returns `Option.none`, otherwise, it returns `Option.some` containing the value.
   *
   * @param value The value to check for existence.
   * @returns An `Option<T>` containing the value if not null or undefined, otherwise `Option.none`.
   */
  public static fromNullable<T>(value: T | null | undefined): Option<T> {
    return value === null || value === undefined
      ? Option.none
      : Option.some(value);
  }

  /**
   * Attempts to execute a function that returns a nullable value and wraps the result in an `Option`.
   * If the function throws an error, it returns `Option.none`.
   *
   * @param fn A function that returns a value or null/undefined.
   * @returns An `Option<T>` containing the function's return value if successful and not null/undefined, otherwise `Option.none`.
   */
  public static tryFromNullable<T>(fn: () => T | null | undefined): Option<T> {
    try {
      return Option.fromNullable(fn());
    } catch (e) {
      return Option.none;
    }
  }

  /**
   * Checks if the `Option` instance contains a value (Some variant).
   *
   * @returns true if the option contains a value, false otherwise.
   */
  public isSome(): boolean {
    return this.__kind === OptionKind.Some;
  }

  /**
   * Checks if the `Option` is `Some` and the value satisfies a predicate function.
   *
   * @param predicate A function that takes the value from an `Option.some` and returns true if it passes the condition.
   * @returns true if the option is `Some` and the value passes the predicate, false otherwise.
   */
  public isSomeAnd(predicate: (value: T) => boolean): boolean {
    return this.isSome() && predicate(this.data as T);
  }

  /**
   * Checks if the `Option` instance does not contain a value (None variant).
   *
   * @returns true if the option does not contain a value, false otherwise.
   */
  public isNone(): boolean {
    return this.__kind === OptionKind.None;
  }

  /**
   * Converts the Option into a Result, wrapping the inner value in an Ok case or using a provided error as an Err case.
   *
   * @template E - The type of the error value.
   * @param error - The error value to use if the Option is None.
   * @returns A Result<T, E>, where T is the inner value type of the Option.
   */
  public okOr<E>(error: E): Result<T, E> {
    return this.isSome() ? Result.ok(this.data as T) : Result.err(error);
  }

  /**
   * Converts the Option into a Result, wrapping the inner value in an Ok case or calling a function to generate an error for the Err case.
   *
   * @template E - The type of the error value.
   * @param error - A function that returns the error value to use if the Option is None.
   * @returns A Result<T, E>, where T is the inner value type of the Option.
   */
  public okOrElse<E>(error: () => E): Result<T, E> {
    return this.isSome() ? Result.ok(this.data as T) : Result.err(error());
  }

  /**
   * Applies a matcher function based on the option's variant (Some or None).
   *
   * The matcher object provides functions for handling both `Some` and `None` cases.
   * The function for the `Some` variant receives the contained value, while the function
   * for the `None` variant receives no arguments.
   *
   * @param matcher An object with two properties:
   *  * `some`: A function that takes the value from an `Option.some` and returns a value of type `U`.
   *  * `none`: A function that returns a value of type `U` (used when the option is `Option.none`).
   * @returns The result of applying the appropriate function from the matcher object based on the option's variant.
   */
  public match<U>(matcher: OptionPattern<T, U>): U {
    return this.isSome() ? matcher.some(this.data as T) : matcher.none();
  }

  /**
   * Returns the value from an `Option.some` variant. Panics with a custom message if it's `Option.none`.
   *
   * @param message The message to display if the option is `Option.none`.
   * @throws Panics if the option is `Option.none`.
   * @returns The value from the `Option.some` variant.
   */
  public expect(message: string): T {
    if (this.isNone()) {
      panic(message);
    }

    return this.data as T;
  }

  /**
   * Returns the value from an `Option.some` variant, panicking with a default message if it's `Option.none`.
   *
   * @throws Panics with a default message if the option is `Option.none`.
   * @returns The value from the `Option.some` variant.
   */
  public unwrap(): T {
    return this.expect("called `Option.unwrap()` on a `None` value");
  }

  /**
   * Returns the value from an `Option.some` variant or a default value if it's `Option.none`.
   *
   * @param defaultValue The value to return if the option is `Option.none`.
   * @returns The value from the `Option.some` variant or the `defaultValue` if the option is `Option.none`.
   */
  public unwrapOr(defaultValue: T): T {
    return this.isSome() ? (this.data as T) : defaultValue;
  }

  /**
   * Returns the value from an `Option.some` variant or the result of calling a function if it's `Option.none`.
   *
   * @param defaultValue A function that returns the default value if the option is `Option.none`.
   * @returns The value from the `Option.some` variant or the result of calling the `defaultValue` function if the option is `Option.none`.
   */
  public unwrapOrElse(defaultValue: () => T): T {
    return this.isSome() ? (this.data as T) : defaultValue();
  }

  /**
   * Applies a function to the value from an `Option.some` variant and returns a new `Option` containing the transformed value.
   * If the option is `Option.none`, it returns `Option.none`.
   *
   * @param mapper A function that takes the value from an `Option.some` and returns a new value.
   * @returns A new `Option<U>` containing the transformed value if the option was `Option.some`, otherwise `Option.none`.
   */
  public map<U>(mapper: (value: T) => U): Option<U> {
    return this.isSome() ? Option.some(mapper(this.data as T)) : Option.none;
  }

  /**
   * Applies a function to the value from an `Option.some` variant and returns the transformed value,
   * or a default value if the option is `Option.none`.
   *
   * @param defaultValue The value to return if the option is `Option.none`.
   * @param mapper A function that takes the value from an `Option.some` and returns a new value.
   * @returns The transformed value from the function applied to the `Option.some` value, or the `defaultValue` if the option is `Option.none`.
   */
  public mapOr<U>(defaultValue: U, mapper: (value: T) => U): U {
    return this.isSome() ? mapper(this.data as T) : defaultValue;
  }

  /**
   * Applies a function to the value from an `Option.some` variant and returns the transformed value,
   * or the result of calling a function that provides a default value if the option is `Option.none`.
   *
   * @param defaultMapper A function that returns the default value if the option is `Option.none`.
   * @param mapper A function that takes the value from an `Option.some` and returns a new value.
   * @returns The transformed value from the function applied to the `Option.some` value, or the result of calling the `defaultMapper` function if the option is `Option.none`.
   */
  public mapOrElse<U>(defaultMapper: () => U, mapper: (value: T) => U): U {
    return this.isSome() ? mapper(this.data as T) : defaultMapper();
  }

  /**
   * Chains two `Option` objects. If the first option is `Option.none`, it propagates the `None` variant.
   * Otherwise, it returns the second option.
   *
   * @param other The second `Option` to chain.
   * @returns An `Option<U>` containing the value from the second option if the first is `Option.some`, otherwise `Option.none`.
   */
  public and<U>(other: Option<U>): Option<U> {
    return this.isSome() ? other : Option.none;
  }

  /**
   * Chains two `Option` objects by applying a function to the value of the first option.
   * If the first option is `Option.none`, it returns `Option.none`.
   * Otherwise, it returns the result of applying the function to the value.
   *
   * @param mapper A function that takes the value from the first `Option` and returns a new `Option<U>`.
   * @returns A new `Option<U>` containing the result of applying the `mapper` function to the value, or `Option.none`.
   */
  public andThen<U>(mapper: (value: T) => Option<U>): Option<U> {
    return this.isSome() ? mapper(this.data as T) : Option.none;
  }

  /**
   * Applies a function to the contained value of an `Option`, returning a new `Option`.
   * This method performs a transformation on the value of the `Option` instance, but only if the instance is `Some`. If the instance is `None`, it returns `Option.none` directly.
   * 
   * @param mapper A function that takes the value of the `Option` (if present) as an argument and returns an `Option<U>`. This function can be used to transform the value into a new type `U` or perform additional logic based on the presence of a value.
   * @returns A new `Option<U>`. If the original `Option` was `Some`, the returned `Option` will contain the result of applying the `mapper` function to the value. Otherwise, the returned `Option` will be `None`.
   * @example
   ```typescript
    const someOption = Option.some(42);
    const maybeMapped = someOption.flatMap(value => Option.some(value * 2)); // Option.some(84)

    const noneOption = Option.none;
    const stillNone = noneOption.flatMap(value => Option.some(value * 2)); // Option.none
    ```
  */
  public flatMap<U>(mapper: (value: T) => Option<U>): Option<U> {
    return this.isSome() ? mapper(this.data as T) : Option.none;
  }

  /**
   * Filters an `Option.some` variant based on a predicate function.
   * If the option is `Option.none` or if the value doesn't satisfy the predicate, it returns `Option.none`.
   * Otherwise, it returns the original `Option`.
   *
   * @param predicate A function that takes the value from an `Option.some` and returns true if it passes the condition.
   * @returns An `Option<T>` containing the original value if it was `Option.some` and passed the predicate, otherwise `Option.none`.
   */
  public filter(predicate: (value: T) => boolean): Option<T> {
    return this.isSomeAnd(predicate) ? this : Option.none;
  }

  /**
   * Combines two `Option` objects by returning the first option if it's `Option.some`, otherwise returning the second option.
   *
   * @param other The second `Option` to combine.
   * @returns An `Option<T>` containing the value from the first option if it's `Option.some`, otherwise the value from the second option.
   */
  public or(other: Option<T>): Option<T> {
    return this.isSome() ? this : other;
  }

  /**
   * Applies a function that returns an `Option` if the first option is `Option.none`.
   * Returns the first option if it's `Option.some`, otherwise returns the result of the applied function.
   *
   * @param mapper A function that returns an `Option` if the first option is `Option.none`.
   * @returns An `Option<T>` containing the value from the first option if it's `Option.some`, otherwise the value from the `mapper` function.
   */
  public orElse(mapper: () => Option<T>): Option<T> {
    return this.isSome() ? this : mapper();
  }

  /**
   * Attempts to flatten a nested `Option` structure.
   *
   * This method checks if the `data` property of the current `Option` instance holds another `Option` object.
   * If it does, it recursively calls `flatten` on the nested `Option` to achieve a flat structure.
   * Otherwise, it returns the current `Option` instance unchanged.
   *
   * @returns A new `Option` with the nested structure flattened (if applicable), or the current `Option` if it's not nested.
   */
  public flatten(): Option<T> {
    if (this.isSome() && this.data instanceof Option) {
      // Type guard for nested Option
      return (this.data as Option<T>).flatten(); // Recursive call for nested flattening
    } else {
      return this; // Not a nested Option, so return itself
    }
  }

  /**
   * Returns a string representation of the `Option`.
   *
   * - If the option is `Option.some`, it returns a string like `"Some(value)"` where `value` is the held value.
   * - If the option is `Option.none`, it returns a string like `"None"` indicating the absence of a value.
   *
   * @returns A string representation of the `Option` object.
   */
  public toString(): string {
    return this.isSome() ? `Some(${this.data})` : "None";
  }
}
