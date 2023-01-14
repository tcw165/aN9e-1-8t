import { faker } from '@faker-js/faker';
import { useState } from 'react';
import { Observable, animationFrameScheduler, combineLatest, debounce, debounceTime, delay, fromEvent, map, observeOn, startWith, switchMap, tap, withLatestFrom } from 'rxjs';
import { app_dep_container } from '../inversify.config';
import { DEFAULT_BUTTON_DELAY_MS } from '../types/constants';
import { DepKeys } from '../types/dependency_keys';
import { AllocationInput, AllocationOutput, InvestorAmount } from '../types/i_api';
import { IAllocationRepo } from '../types/i_repo';
import { Single } from '../types/rx_single';
import { UiEvent, UiStatus } from '../types/ui_events';
import { randomInt } from '../utilities/random';
import { inputEvent$, inputEventInt$ } from '../utilities/rx_input_event';
import rxUseEffect from '../utilities/rx_use_effect';

const DEFAULT_NUM_OF_INVESTORS = 3;

const ID_ALLOCATION_AMOUNT = 'allocation_amount';
const ID_INVESTOR_NAME = 'name_';
const ID_REQUESTED_AMOUNT = 'requested_amount_';
const ID_AVERAGE_AMOUNT = 'average_amount_';
const ID_BTN_SUBMIT = 'btn_submit_allocation';
const ID_BTN_RANDOM = 'btn_random';

function collectInputs$(
  document: Document,
  num_investors: number,
): Observable<AllocationInput> {
  const inputs$: Observable<any>[] = [];

  // Add the allocation amount to the observable collections.
  const allocation_amount_dom = document.getElementById(ID_ALLOCATION_AMOUNT)! as HTMLInputElement;
  const allocation_amount$ = inputEventInt$(allocation_amount_dom);
  inputs$.push(allocation_amount$);

  const investor_amounts_observables: Observable<InvestorAmount>[] = [];
  for (let i = 0; i < num_investors; ++i) {
    const investor_name$ = inputEvent$(document.getElementById(`${ID_INVESTOR_NAME}${i}`)! as HTMLInputElement);
    const requested_amount$ = inputEventInt$(document.getElementById(`${ID_REQUESTED_AMOUNT}${i}`)! as HTMLInputElement);
    const average_amount$ = inputEventInt$(document.getElementById(`${ID_AVERAGE_AMOUNT}${i}`)! as HTMLInputElement);

    investor_amounts_observables.push(
      combineLatest([investor_name$, requested_amount$, average_amount$])
        .pipe(
          map(([n, requested, average]: [string, number, number]) => {
            const output: InvestorAmount = {
              name: n,
              requested_amount: requested,
              average_amount: average,
            };

            return output;
          }),
        )
    );
  }
  const investor_amounts$ = combineLatest(investor_amounts_observables);

  return combineLatest([allocation_amount$, investor_amounts$])
    .pipe(
      map(([allocation, investors]) => {
        return {
          allocation_amount: allocation,
          investor_amounts: investors,
        };
      }),
      debounceTime(50),
      tap((inputs) => {
        console.log(`inputs=${JSON.stringify(inputs)}`);
      })
    );
}

function getAllocation$(
  repo: IAllocationRepo,
  input: AllocationInput,
): Single<UiEvent> {
  return repo.allocate(input)
    .pipe(
      delay(1000), // For showing you the UI loading effect
      map<AllocationOutput, UiEvent>(res => { return { status: UiStatus.DONE, data: res }; }),
      startWith({ status: UiStatus.BUSY, data: {} }),
    );
}

function generateRandomInvestorAmounts(
  n: number,
): InvestorAmount[] {
  let ret: InvestorAmount[] = [];

  for (let i = 0; i < n; ++i) {
    ret.push({
      name: faker.name.fullName(),
      requested_amount: randomInt(15, 100),
      average_amount: randomInt(15, 100),
    });
  }

  return ret;
}

function notifyChangeEvents(
  document: Document,
  num_investors: number,
) {
  const allocation_amount_dom = document.getElementById(ID_ALLOCATION_AMOUNT)! as HTMLInputElement;
  allocation_amount_dom.dispatchEvent(new Event('change'));

  for (let i = 0; i < num_investors; ++i) {
    const investor_name_dom = document.getElementById(`${ID_INVESTOR_NAME}${i}`)! as HTMLInputElement;
    const requested_amount_dom = document.getElementById(`${ID_REQUESTED_AMOUNT}${i}`)! as HTMLInputElement;
    const average_amount_dom = document.getElementById(`${ID_AVERAGE_AMOUNT}${i}`)! as HTMLInputElement;

    investor_name_dom.dispatchEvent(new Event('change'));
    requested_amount_dom.dispatchEvent(new Event('change'));
    average_amount_dom.dispatchEvent(new Event('change'));
  }
}

export default function AllocationForm() {
  // TODO: Support >3 investors from UI
  const [num_investors, set_num_investors] = useState(DEFAULT_NUM_OF_INVESTORS);
  const [loading, set_loading] = useState(false);
  const [amounts, set_amounts] = useState(generateRandomInvestorAmounts(DEFAULT_NUM_OF_INVESTORS));

  // Wire events for allocation logics
  rxUseEffect(() => {
    const btn_submit = document.getElementById(ID_BTN_SUBMIT)!;
    const repo = app_dep_container.get<IAllocationRepo>(DepKeys.AllocationRepo);

    return fromEvent(btn_submit, 'click')
      .pipe(
        debounceTime(DEFAULT_BUTTON_DELAY_MS), // Protect the golden finger (hammering button really fast!)
        withLatestFrom(collectInputs$(document, num_investors)),
        switchMap(([_, inputs]) => {
          return getAllocation$(repo, inputs);
        }),
        observeOn(animationFrameScheduler),
      )
      .subscribe({
        next: (evt: UiEvent) => {
          if (evt.status == UiStatus.DONE) {
            set_loading(false);
            repo.setAllocation(evt.data as AllocationOutput);
          } else if (evt.status == UiStatus.BUSY) {
            set_loading(true);
          }
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          set_loading(false);
        },
      });
  }, []);

  // Randomization
  rxUseEffect(() => {
    const btn_random = document.getElementById(ID_BTN_RANDOM)!;

    // Manually notify DOM about the changes so that Rx stream could capture that, T_T.
    notifyChangeEvents(document, num_investors);

    return fromEvent(btn_random, 'click')
      .pipe(
        debounceTime(DEFAULT_BUTTON_DELAY_MS),
      )
      .subscribe({
        next: (_) => {
          set_amounts(generateRandomInvestorAmounts(num_investors));
        },
      })
  }, [amounts]);

  // TODO: Validate inputs
  rxUseEffect(() => {
    // collectInputs$(document, num_investors)
    //   .subscribe();
  });

  return (
    <form className='my-card'>
      <div className='mb-6'>
        <label className='my-label'>
          Total Available Allocation
        </label>
        <input type="number" id={`${ID_ALLOCATION_AMOUNT}`} className='my-input' defaultValue="300" disabled={loading} required />
      </div>

      <div className='mb-6'>
        <label className='my-label'>
          Investor Breakdown
        </label>
        <ul>
          {
            Array(num_investors).fill(1).map((_, i) => {
              return (
                <li key={i} className='flex flex-row'>
                  <input type="text" id={`${ID_INVESTOR_NAME}${i}`} className='my-input' defaultValue={amounts[i].name} placeholder="Name" disabled={loading} required />

                  <input type="number" id={`${ID_REQUESTED_AMOUNT}${i}`} className='my-input' defaultValue={amounts[i].requested_amount.toString()} placeholder="Requested Amount" disabled={loading} required />

                  <input type="number" id={`${ID_AVERAGE_AMOUNT}${i}`} className='my-input' defaultValue={amounts[i].average_amount.toString()} placeholder="Average Amount" disabled={loading} required />
                </li>
              );
            })
          }
        </ul>
      </div>

      <div className='flex flex-row'>
        <button id={ID_BTN_SUBMIT} type="button" className='my-button-primary' disabled={loading}>
          {loading ? `Updating...` : `Prorate`}
        </button>

        <button id={ID_BTN_RANDOM} type="button" className='my-button-secondary' disabled={loading}>
          Random
        </button>
      </div>
    </form>
  );
}