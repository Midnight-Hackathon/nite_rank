import * as readline from "readline/promises";
import { buildAndSyncWallet, isValidSeed } from "../utils/wallet.js";
import { loadDeploymentInfo, loadContractModule, initializeProviders, connectToContract } from "../utils/contract.js";
import { saveTransactionProof } from "../utils/proofCapture.js";
import * as dotenv from "dotenv";
import * as Rx from "rxjs";
import { bech32m } from "bech32";
import { createWitnesses } from "../utils/witnesses.js";
dotenv.config();

/**
 * Submit Proof interaction script - submits a run proof to the Aseryx contract
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Aseryx Contract - Submit Run Proof\n");

  try {
    // Check deployment.json
    const deployment = loadDeploymentInfo();
    if (!deployment) {
      console.error("No deployment.json found! Run 'npm run deploy' first.");
      process.exit(1);
    }

    console.log(`Contract Address: ${deployment.contractAddress}\n`);

    // Get wallet seed
    const walletSeed = process.env.WALLET_SEED;
    if (!walletSeed || !isValidSeed(walletSeed)) {
      console.error("Invalid seed: Must be 64 hex characters.");
      process.exit(1);
    }

    console.log("Connecting to Midnight Testnet...\n");

    // Build and sync wallet
    const wallet = await buildAndSyncWallet(walletSeed);
    const state = await Rx.firstValueFrom(wallet.state());
    const decoded = bech32m.decode(state.coinPublicKey);
    const userPk = new Uint8Array(bech32m.fromWords(decoded.words)); // Decode to bytes

    // Validate decoded PK
    if (userPk.length !== 32) {
      console.error(`Invalid decoded PK length: ${userPk.length} (expected 32)`);
      process.exit(1);
    }
    console.log(`Wallet address: ${state.address}\n`);

    // Hardcode run details for testing
    const distance = 6000;  // 6km in meters
    const duration = 1000;  // 1000 seconds

    console.log(`\nDistance: ${distance} meters`);
    console.log(`Duration: ${duration} seconds\n`);

    // Load compiled contract - witnesses NOW provide the private data!
    const { AseryxModule, contractPath } = await loadContractModule();
    const contractInstance = new AseryxModule.Contract(
      createWitnesses(distance, duration)
    );

    // Configure providers
    const providers = await initializeProviders(contractPath, wallet);

    // Connect to deployed contract
    const deployed: any = await connectToContract(
      providers,
      deployment.contractAddress,
      contractInstance
    );

    console.log("Connected to contract!\n");

    // Submit the run proof (proof gen uses witnesses during tx)
    console.log("Submitting run proof to contract...\n");

    try {
      // NOW: Only pass userPk (distance/duration come from witnesses!)
      const tx = await deployed.callTx.submitRunProof(userPk);
      
      // SAVE THE PROOF DATA FOR SHARING/AUDITING
      saveTransactionProof(tx, "submitRunProof", {
        userAddress: state.address,
        distance,
        duration
      });
      
      console.log("\n✓ Success!");
      console.log(`Run proof submitted for user: ${state.address}`);
      console.log(`Tx ID: ${tx.public.txId}`);
      console.log(`Block: ${tx.public.blockHeight}`);
      console.log(`\nProof saved to ./proofs/ directory for sharing`);
      console.log();
    } catch (err: unknown) {
      console.error("Failed to submit proof:");
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }

    // Cleanup
    await wallet.close();
  } catch (error: any) {
    console.error("\nUnexpected error:", error.message || error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);