import { Observable } from "rxjs";
import { AllocationInput, AllocationOutput } from "./i_api";
import { Single } from "./rx_single";

export interface IAllocationRepo {
  allocate(input: AllocationInput): Single<AllocationOutput>;

  setAllocation(result: AllocationOutput): void;
  observeAllocation(): Observable<AllocationOutput>;
}