import * as readline from "readline/promises";
import { buildAndSyncWallet, isValidSeed } from "../utils/wallet.js";
import { loadDeploymentInfo, loadContractModule, initializeProviders, connectToContract } from "../utils/contract.js";
import { AseryxPrivateState } from "../utils/witnesses.js";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import * as dotenv from "dotenv";
import * as Rx from "rxjs";
import { bech32m } from "bech32";
dotenv.config();

/**
 * Register interaction script - registers a user with the Aseryx contract
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Aseryx Contract - Register User\n");

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
    let state;
    try {
      state = await Rx.firstValueFrom(wallet.state());
    } catch (syncErr) {
      console.error("Wallet sync failed:", syncErr);
      process.exit(1);
    }
    const decoded = bech32m.decode(state.coinPublicKey);
    const userPk = new Uint8Array(bech32m.fromWords(decoded.words)); // Decode to bytes

    // Validate bytes
    if (!userPk || userPk.length !== 32) {
      console.error("Invalid public key: Expected 32-byte Uint8Array.");
      process.exit(1);
    }

    console.log(`Your wallet public key (hex): ${state.address}\n`);

    // Load compiled contract
    const { AseryxModule, contractPath } = await loadContractModule();
    const contractInstance = new AseryxModule.Contract({
      runDistance: ({ privateState }: WitnessContext<typeof AseryxModule.ledger, AseryxPrivateState>): [AseryxPrivateState, bigint] => 
        [privateState, 0n],
      runDuration: ({ privateState }: WitnessContext<typeof AseryxModule.ledger, AseryxPrivateState>): [AseryxPrivateState, bigint] => 
        [privateState, 0n]
    });

    // Configure providers
    const providers = await initializeProviders(contractPath, wallet);

    // Connect to deployed contract
    const deployed: any = await connectToContract(
      providers,
      deployment.contractAddress,
      contractInstance
    );

    console.log("Connected to contract!\n");

    // Optional: Confirm
    const confirm = await rl.question("Register this user? (y/n): ");
    if (confirm.toLowerCase() !== 'y') {
      console.log("Registration cancelled.");
      process.exit(0);
    }

    console.log("Registering user...\n");

    try {
      const tx = await deployed.callTx.registerUser(userPk);
      console.log("Success!");
      console.log(`User registered with public key: ${state.address}`);
      console.log(`Tx ID: ${tx.public.txId}`);
      console.log(`Block: ${tx.public.blockHeight}\n`);
    } catch (err: any) {
      console.error("Failed to register user:");
      console.error(err.message || err);
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