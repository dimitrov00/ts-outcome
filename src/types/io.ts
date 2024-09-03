export const io = <T>(effect: () => Promise<T>) => IO.fromPromise(effect);

/**
 * Represents an effectful computation that returns a Promise.
 *
 * The `IO` monad allows you to encapsulate effects (like asynchronous operations)
 * and chain them together in a functional style.
 */
export class IO<T> {
  private constructor(private readonly effect: () => Promise<T>) {}

  /**
   * A static readonly property representing an `IO` monad resolving to `undefined`.
   *
   * This property aligns with the concept of the unit element (often denoted by `unit`)
   * in functional programming. It serves as a neutral element for `chain` operations
   * within the `IO` monad, allowing for the composition of effects without introducing
   * an initial value.
   */
  public static readonly unit = IO.from(undefined);

  /**
   * Static factory method to create an `IO` monad from a constant value.
   *
   * @param value - The constant value to wrap in an `IO` monad.
   * @returns An `IO` monad resolving to the provided `value`.
   */
  public static from<T>(value: T | IO<T>): IO<T> {
    if (value instanceof IO) {
      return new IO(value.effect);
    }

    return new IO(() => Promise.resolve(value));
  }

  /**
   * Static factory method to create an `IO` monad from a Promise-returning function.
   *
   * @param promise - A function that returns a Promise of type `T`.
   * @returns An `IO` monad that resolves to the result of the provided `promise`.
   */
  public static fromPromise<T>(promise: () => Promise<T>): IO<T> {
    return new IO(promise);
  }

  /**
   * Attaches an error handler to the `IO` monad.
   *
   * This method allows you to specify a function that will be called if the effect
   * within the `IO` monad throws an error. The provided handler function can return
   * another `IO` monad, effectively allowing for error recovery within the chain.
   *
   * @param handler - A function that takes an error and returns an `IO` monad.
   *                  The handler function can perform error handling logic and potentially
   *                  return a new `IO` to continue the chain.
   * @returns An `IO` monad that incorporates the provided error handler.
   */
  public catch<U extends Error | unknown>(handler: (error: U) => IO<T>): IO<T> {
    return new IO(() =>
      this.effect().catch((error) => handler(error).effect())
    );
  }

  /**
   * Chains another effectful computation to the current `IO` monad.
   *
   * This method takes a function that maps the result of the current `IO` computation
   * to another `IO` computation. It then returns a new `IO` monad representing the
   * result of applying the provided function to the current computation.
   *
   * @param mapper - A function that takes the result of the current `IO` computation
   *                 and returns another `IO` computation.
   * @returns An `IO` monad representing the result of chaining the current computation
   *          with the computation returned by the `mapper` function.
   */
  public chain<U>(mapper: (value: T) => IO<U>): IO<U> {
    return new IO<U>(() =>
      this.effect().then((result) => mapper(result).effect())
    );
  }

  /**
   * Executes the effect encapsulated by the `IO` monad and returns a Promise.
   *
   * This method triggers the execution of the effectful computation within the `IO`
   * monad. It returns a Promise that resolves to the final value of the computation.
   *
   * @returns A Promise that resolves to the value produced by the effect.
   */
  public run(): Promise<T> {
    return this.effect();
  }
}