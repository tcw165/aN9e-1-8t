import { useState } from "react";
import { app_dep_container } from "../inversify.config";
import { DepKeys } from "../types/dependency_keys";
import { IAllocationRepo } from "../types/i_repo";
import rxUseEffect from "../utilities/rx_use_effect";

export default function AllocationResult() {
  const [output, set_output] = useState({});

  rxUseEffect(() => {
    const repo = app_dep_container.get<IAllocationRepo>(DepKeys.AllocationRepo);
    return repo.observeAllocation()
      .subscribe({
        next: (v) => {
          console.log(v);
          set_output(v);
        },
      });
  });

  return (
    <div className="my-card">
      <table className="min-w-full">
        <thead className="border-b">
          <tr key='h'>
            <th key='h-name' className="my-th">Name</th>
            <th key='h-amount' className="my-th">Allocation Amount</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(output).map(([name, amounts]) => {
              return (
                <tr key={`tr-${name}`}>
                  <td key={`td-${name}`} className="my-td">{`${name}`}</td>
                  <td key={`td-${name}-amounts`} className="my-td">{`$${(amounts as number).toLocaleString()}`}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
}