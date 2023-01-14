import { DependencyList, useEffect } from "react";
import { Subscription } from "rxjs";

export default function rxUseEffect(
  rx_block: () => (void | Subscription),
  deps?: DependencyList,
) {
  useEffect(() => {
    const subscription = rx_block();

    // cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, deps);
}