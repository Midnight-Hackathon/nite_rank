import { Ledger } from "../../contracts/managed/aseryx/contract/index.cjs";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

// Private state type (empty for now since you don't use it)
export type AseryxPrivateState = {};

export const createAseryxPrivateState = (): AseryxPrivateState => ({});

// Witness implementations for proving actual run data
export const createWitnesses = (distance: number, duration: number) => ({
  runDistance: ({ privateState }: WitnessContext<Ledger, AseryxPrivateState>): [AseryxPrivateState, bigint] => 
    [privateState, BigInt(distance)],
  
  runDuration: ({ privateState }: WitnessContext<Ledger, AseryxPrivateState>): [AseryxPrivateState, bigint] => 
    [privateState, BigInt(duration)]
});

// Dummy witnesses for operations that don't use distance/duration (deploy, register)
export const createDummyWitnesses = () => ({
  runDistance: ({ privateState }: WitnessContext<Ledger, AseryxPrivateState>): [AseryxPrivateState, bigint] => 
    [privateState, 0n],
  
  runDuration: ({ privateState }: WitnessContext<Ledger, AseryxPrivateState>): [AseryxPrivateState, bigint] => 
    [privateState, 0n]
});
