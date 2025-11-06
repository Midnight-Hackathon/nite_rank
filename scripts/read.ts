import * as readline from "readline/promises";
import { buildAndSyncWallet, isValidSeed } from "../utils/wallet.js";
import {
  loadDeploymentInfo,
  loadContractModule,
  initializeProviders,
  readCurrentMessage
} from "../utils/contract.js";

import * as dotenv from "dotenv";
dotenv.config();

/**
 * Read interaction script - reads the current message from the Hello World contract
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Hello World Contract - Read Message\n");

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

    console.log("\nConnecting to Midnight Testnet...\n");

    // Build and sync wallet
    const wallet = await buildAndSyncWallet(walletSeed);

    // Load compiled contract
    const { HelloWorldModule, contractPath } = await loadContractModule();

    // Configure providers
    const providers = await initializeProviders(contractPath, wallet);

    console.log("Connected to contract!\n");
    console.log("Querying current message...\n");

    try {
      const currentMessage = await readCurrentMessage(
        providers,
        deployment.contractAddress,
        HelloWorldModule
      );

      if (currentMessage) {
        console.log(`Current message: "${currentMessage}"\n`);
      } else {
        console.log("No message stored yet.\n");
      }
    } catch (err: any) {
      console.error("Failed to read message:");
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
