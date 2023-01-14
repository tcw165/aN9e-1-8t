const DepKeys = {
  // Network
  HttpClient: Symbol.for("HttpClient"),
  Api: Symbol.for("Api"),

  // In-memory repository
  AllocationRepo: Symbol.for("AllocationRepo"),
};

export { DepKeys };