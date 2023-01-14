import { Axios } from "axios";
import { inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { DepKeys } from "../types/dependency_keys";
import * as i_api from "../types/i_api";
import { IAllocationRepo } from "../types/i_repo";
import { Single } from "../types/rx_single";

@injectable()
class AllocationRepo implements IAllocationRepo {

  private m_http_client: Axios;
  private listeners: Array<(v: i_api.AllocationOutput) => {}> = [];

  constructor(
    @inject(DepKeys.HttpClient) http_client: Axios,
  ) {
    this.m_http_client = http_client;
  }

  allocate(input: i_api.AllocationInput): Single<i_api.AllocationOutput> {
    return new Observable<i_api.AllocationOutput>((scbr) => {
      if (scbr.closed) return;

      const controller = new AbortController();

      this.m_http_client.post(`/allocate`, input, { signal: controller.signal })
        .then((res) => {
          const output = res.data;
          scbr.next(output);
        })
        .catch((err) => {
          scbr.error(err);
        })
        .then(() => {
          // Complete this stream
          scbr.complete();
        });

      scbr.add(() => {
        controller.abort();
      });
    });
  }

  setAllocation(result: i_api.AllocationOutput): void {
    // Publish items to the other observers
    this.listeners.forEach((l) => {
      l(result);
    });
  }

  observeAllocation(): Observable<i_api.AllocationOutput> {
    return new Observable<i_api.AllocationOutput>((scbr) => {
      const listener = (v: i_api.AllocationOutput) => {
        scbr.next(v);
        return {};
      };

      this.listeners.push(listener);

      scbr.add(() => {
        // Remove listner
        this.listeners.splice(this.listeners.indexOf(listener), 1);
      });
    });
  }
}

export default AllocationRepo;