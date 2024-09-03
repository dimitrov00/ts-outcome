# ts-outcome

ts-outcome is a TypeScript library inspired by functional programming languages like Rust and Haskell. It provides implementations of common types such as Option, Result, and IO, offering safe and structured ways to handle optional values, represent the outcome of operations, and encapsulate effectful computations.

With ts-outcome, you can:

- **Option**: Represent optional values that may or may not exist, avoiding potential runtime errors associated with null or undefined checks.
- **Result**: Handle the result of operations that can either be successful (Ok) or unsuccessful (Err), providing methods for error handling and manipulation in a structured manner.
- **IO**: Encapsulate effectful computations, such as asynchronous operations, and chain them together in a functional style.

This library aims to promote safer and more expressive TypeScript code by leveraging concepts from functional programming. Whether you're dealing with optional values, error handling, or asynchronous operations, ts-outcome provides robust solutions to common programming challenges.

## Contents

- [Installation](#installation)
- [Example](#example)
    - [Option Example](#option-example)
    - [Result Example](#result-example)
    - [IO Example](#io-example)
- [Usage](#usage)
    - [Option](#option-usage)
        - [Creation](#option-creation)
        - [Accessing Values](#option-accessing-values)
        - [Mapping and Chaining](#option-mapping-and-chaining)
        - [Filtering](#option-filtering)
        - [Matching](#option-matching)
        - [Converting to Result](#option-converting-to-result)
    - [Result](#result)
        - [Creation](#result-creation)
        - [Accessing Values](#result-accessing-values)
        - [Mapping and Chaining](#result-mapping-and-chaining)
        - [Matching](#result-matching)
        - [Converting to Option](#result-converting-to-option)
    - [IO](#io)
        - [Creation](#io-creation)
        - [Chaining](#io-chaining)
        - [Error Handling](#io-error-handling)
        - [Executing](#io-executing)

## Installation

You can install ts-outcome via npm or yarn:

```bash
npm install ts-outcome
# or    
yarn add ts-outcome
```

## Example

### Option Example

#### Domain Modeling with TypeScript: Nullable vs. Option Types

This section demonstrates how to model domain concepts in TypeScript using both nullable types and Option types. We'll explore the benefits of Option types for improved type safety and expressiveness.

**Example**: Contact Information

Let's define a `Contact` type representing a person's contact details:

**Using Nullable Types:**

```typescript
type Contact = {
  name: string;
  email?: string; // Optional email using nullable type
  phone?: string; // Optional phone number using nullable type
};
```

Here, `email` and `phone` are declared as optional using the question mark (`?`). This allows them to be `null` or `undefined` at runtime.

**Problems with Nullable Types:**

- **Lack of Clarity:** Nullable types don't explicitly indicate the absence of a value. Code using them might need additional checks if `null` is a valid state.

- **Runtime Errors:** Null checks are prone to runtime errors if not handled carefully.

**Using Option Types:**

```typescript
type Contact = {
  name: string;
  email: Option<string>; // Email as an Option type
  phone: Option<string>; // Phone number as an Option type
};
```

Here, we define an `Option<T>` type that can either be Some(value) containing a valid value of type T, or None representing the absence of a value. This approach offers several advantages:

- **Explicitness**: Option types clearly convey whether a value is present or not, enhancing code readability.

- **Type Safety**: The compiler enforces handling the None case, preventing potential null pointer exceptions.

- **Declarative Operations**: Option types allow for more declarative operations like mapping and filtering without explicit null checks.

**Benefits of Option Types:**

- **Improved Type Safety**: Option types eliminate the possibility of null-related errors at compile time.
- **Enhanced Code Readability**: Code using Option types is more explicit and easier to understand.
- **Safer Data Handling**: Option types enforce handling the absence of values, preventing unexpected behavior.
- **Functional Programming**: Option types integrate well with functional programming concepts like mapping and filtering.

By adopting Option types, you can write more robust and expressive TypeScript code, ensuring clarity and safety in how your application handles optional values.