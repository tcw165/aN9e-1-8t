import { AllocationInput, AllocationOutput, IAllocationApi } from "../types/i_api";
import { Axios } from "axios";
import { DepKeys } from "../types/dependency_keys";
import { inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { Single } from "../types/rx_single";
import { deprecate } from "util";

@injectable()
class AllocationApi implements IAllocationApi {

  private m_http_client: Axios;

  constructor(
    @inject(DepKeys.HttpClient) http_client: Axios,
  ) {
    this.m_http_client = http_client;
  }

  calculate(input: AllocationInput): Single<AllocationOutput> {
    return new Observable<AllocationOutput>((scbr) => {
      if (scbr.closed) return;

      const controller = new AbortController();

      this.m_http_client.post(`/allocate`, input, { signal: controller.signal })
        .then((res) => {
          scbr.next(res.data);
        })
        .catch((err) => {
          scbr.error(err);
        })
        .then(() => {
          scbr.complete();
        });

      scbr.add(() => {

        controller.abort();
      });
    });
  }
}

// TODO: Deprecate this
export default AllocationApi;