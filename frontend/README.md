# Overall Architecture

* [Inversify](https://inversify.io/) for Dependency Injection and managing class's scopes.
  * [inversify.config.ts](./inversify.config.ts) defines the DI graph for the app (in browser).
  * [types/i_repo.ts](./types/i_repo.ts) collects all the interface declarations for repositories. e.g. The HTTP calls are encapsulated in the repository and repository is observable.
  * [types/i_api.ts](./types/i_api.ts) collects input and output types for API.
* [Axios](https://axios-http.com/docs/intro) for browser-side HTTP client.
* [next.config.js](./next.config.js) provides the environment variable for JavaScript bundle in browser.
* React Components:
  * [AllocationForm](./components/allocation_form.tsx) contains the UI that hits API.
  * [AllocationResult](./components/allocation_result.tsx) contains the UI that present the API response.

```
              <Home/>
             /        \
<AllocationForm/>   <AllocationResult/>
```

* `./utilities` package should contain stateless functions (not classes).
  * [./utilities/rx_use_effect.ts](./utilities/rx_use_effect.ts) is the shim over React's side-effect with the integration with RxJs.
  * [./utilities/rx_input_event.ts](./utilities/rx_input_event.ts) is the helper methods for getting RxJs Observable from HTML DOM elements.
  * ...etc
* `./types` package should contain all type's declaration.
  * [./types/dependency_keys.ts](./types/dependency_keys.ts) collects keys for Inversify injection.
  * [./types/constants.ts](./types/constants.ts) collects constants.
  * [./types/rx_completable.ts](./types/rx_completable.ts) is a type-alias of RxJs Observable, which implies the Observable should only call subscriber's `complete()`.
  * [./types/rx_single.ts](./types/rx_single.ts) is a type-alias of RxJs Observable, which implies the Observable should only call subscriber's `next()` once. i.e. Emits single event.
  * [./types/ui_events.ts](./types/ui_events.ts) is a temporary solution for wrapping around UI Event enum and the data.
