import { Ledger } from "../contracts/managed/aseryx/contract/index.cjs";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

// Private state type (empty for now since you don't use it)
export type AseryxPrivateState = {};

export const createAseryxPrivateState = (): AseryxPrivateState => ({});

// Witness implementations
export const createWitnesses = (distance: number, duration: number) => ({
  runDistance: ({ privateState }: WitnessContext<Ledger, AseryxPrivateState>): [AseryxPrivateState, bigint] => 
    [privateState, BigInt(distance)],
  
  runDuration: ({ privateState }: WitnessContext<Ledger, AseryxPrivateState>): [AseryxPrivateState, bigint] => 
    [privateState, BigInt(duration)]
});
