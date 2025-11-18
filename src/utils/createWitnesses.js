//utils/createWitnesses.js
import { AseryxModule } from '../../contracts/managed/aseryx/contract/index.cjs';


export const createWitnesses = (distanceMeters, durationSeconds) => {
  return AseryxModule.witnesses.submitRunProof({
    distance: BigInt(distanceMeters),
    duration: BigInt(durationSeconds),
  });
};