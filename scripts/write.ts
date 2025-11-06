import * as readline from "readline/promises";
import { buildAndSyncWallet, isValidSeed } from "../utils/wallet.js";
import { loadDeploymentInfo, loadContractModule, initializeProviders, connectToContract} from "../utils/contract.js";
import "../utils/config.js";  // Initialize Midnight config (WebSocket, NetworkId)
import * as dotenv from "dotenv";
dotenv.config();
/**
 * Write interaction script - stores a message to the Hello World contract
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Hello World Contract - Write Message\n");

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
    const contractInstance = new HelloWorldModule.Contract({});

    // Configure providers
    const providers = await initializeProviders(contractPath, wallet);

    // Connect to deployed contract
    const deployed: any = await connectToContract(
      providers,
      deployment.contractAddress,
      contractInstance
    );

    console.log("Connected to contract!\n");

    // Get message to store
    const message = await rl.question("Enter your message: ");
    if (!message.trim()) {
      console.error("Message cannot be empty.");
      process.exit(1);
    }

    console.log("\nSubmitting transaction... (this may take 20–60 seconds)\n");

    try {
      const tx = await deployed.callTx.storeMessage(message);
      console.log("Success!");
      console.log(`Message stored: "${message}"`);
      console.log(`Tx ID: ${tx.public.txId}`);
      console.log(`Block: ${tx.public.blockHeight}\n`);
    } catch (err: any) {
      console.error("Failed to store message:");
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
