import * as readline from "readline/promises";
import { buildAndSyncWallet, isValidSeed } from "../utils/wallet.js";
import {
  loadDeploymentInfo,
  loadContractModule,
  initializeProviders,
  connectToContract
} from "../utils/contract.js";

import * as dotenv from "dotenv";
dotenv.config();

/**
 * Read interaction script - retrieves an entry from the Aseryx contract
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Aseryx Contract - Get Entry\n");

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
    const { AseryxModule, contractPath } = await loadContractModule();
    const contractInstance = new AseryxModule.Contract({});

    // Configure providers
    const providers = await initializeProviders(contractPath, wallet);

    // Connect to deployed contract
    const deployed: any = await connectToContract(
      providers,
      deployment.contractAddress,
      contractInstance
    );

    console.log("Connected to contract!\n");

    // Get entry details
    const entryIdStr = await rl.question("Enter entry ID to retrieve: ");
    const entryId = parseInt(entryIdStr, 10);
    
    if (isNaN(entryId) || entryId < 0) {
      console.error("Invalid entry ID. Must be a non-negative number.");
      process.exit(1);
    }

    const callerIdStr = await rl.question("Enter your caller ID: ");
    const callerId = parseInt(callerIdStr, 10);
    
    if (isNaN(callerId) || callerId < 0) {
      console.error("Invalid caller ID. Must be a non-negative number.");
      process.exit(1);
    }

    console.log("\nRetrieving entry...\n");

    try {
      // Call as transaction since it has assertions
      const tx = await deployed.callTx.get_entry(
        BigInt(entryId),
        BigInt(callerId)
      );
      
      // Access the return value from the transaction
      const encryptedData = tx.returns?.[0];
      
      if (!encryptedData) {
        console.error("No data returned from transaction");
        process.exit(1);
      }
      
      const decoder = new TextDecoder();
      const dataString = decoder.decode(encryptedData).replace(/\0+$/, '');
      
      console.log("Success!");
      console.log(`Entry ID: ${entryId}`);
      console.log(`Data: ${dataString}`);
      console.log(`Tx ID: ${tx.public.txId}`);
      console.log(`Block: ${tx.public.blockHeight}\n`);
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
