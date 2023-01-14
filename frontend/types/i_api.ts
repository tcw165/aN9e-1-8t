import { Single } from "./rx_single";

export interface InvestorAmount {
  name: string;
  requested_amount: number;
  average_amount: number;
}

export interface AllocationInput {
  allocation_amount: number;
  investor_amounts: InvestorAmount[];
}

export type AllocationOutput = {
  [key: string]: number;
}

export interface IAllocationApi {
  calculate(input: AllocationInput): Single<AllocationOutput>;
}