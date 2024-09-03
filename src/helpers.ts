export function panic(msg: string = "explicit panic"): never {
  throw new Error(`panicked at '${msg}'`);
}

export function unimplemented(msg?: string): never {
  return panic(msg ? `not implemented: ${msg}` : "not implemented");
}

export function todo(msg?: string): never {
  return panic(msg ? `not yet implemented: ${msg}` : "not yet implemented");
}
