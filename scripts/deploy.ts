import { buildAndSyncWallet, createWalletProvider } from "../utils/wallet.js";
import { TESTNET_CONFIG } from "../utils/config.js";
import "../utils/config.js";  // Initialize Midnight config (WebSocket, NetworkId)
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { nativeToken } from "@midnight-ntwrk/ledger";
import * as fs from "fs";
import * as path from "path";
import * as Rx from "rxjs";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("=".repeat(60));
  console.log("Midnight Contract Deployment");
  console.log("=".repeat(60) + "\n");

  try {
    const walletSeed = process.env.WALLET_SEED;

    // Check if wallet exists
    if (!walletSeed) {
      console.error("✗ No wallet found!\n");
      console.log("Please set up your wallet first by running:");
      console.log("  npm run create-wallet\n");
      console.log("Then try deploying again.");
      console.log("=".repeat(60));
      process.exit(1);
    }

    // Build and sync wallet
    console.log("📡 Connecting wallet to Midnight Testnet...");
    const wallet = await buildAndSyncWallet(walletSeed);

    const state = await Rx.firstValueFrom(wallet.state());
    console.log(`✓ Wallet connected: ${state.address}`);

    const balance = state.balances[nativeToken()] || 0n;

    if (balance === 0n) {
      console.error("\n✗ Insufficient funds!\n");
      console.log("Your wallet has no tDUST tokens.");
      console.log("Please fund your wallet:");
      console.log("  1. Visit: https://midnight.network/test-faucet");
      console.log(`  2. Send tokens to: ${state.address}\n`);
      console.log("Then try deploying again.");
      console.log("=".repeat(60));
      await wallet.close();
      process.exit(1);
    }

    console.log(`✓ Wallet balance: ${balance} tDUST`);

    console.log("\n📦 Loading contract...");
    const contractPath = path.join(process.cwd(), "contracts");
    const contractModulePath = path.join(
      contractPath,
      "managed",
      "hello-world",
      "contract",
      "index.cjs"
    );

    if (!fs.existsSync(contractModulePath)) {
      console.error("✗ Contract not found! Run: npm run compile");
      process.exit(1);
    }

    const HelloWorldModule = await import(contractModulePath);
    const contractInstance = new HelloWorldModule.Contract({});

    // Create wallet provider using utility function
    console.log("🔧 Setting up wallet provider...");
    const walletProvider = await createWalletProvider(wallet);

    console.log("🔧 Setting up providers...");
    const zkConfigPath = path.join(contractPath, "managed", "hello-world");
    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: "hello-world-state"
      }),
      publicDataProvider: indexerPublicDataProvider(
        TESTNET_CONFIG.indexer,
        TESTNET_CONFIG.indexerWS
      ),
      zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
      proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
      walletProvider: walletProvider,
      midnightProvider: walletProvider
    };

    console.log("\n🚀 Deploying contract...");
    console.log("⏳ This may take 30-60 seconds...\n");

    const deployed = await deployContract(providers, {
      contract: contractInstance,
      privateStateId: "helloWorldState",
      initialPrivateState: {}
    });

    const contractAddress = deployed.deployTxData.public.contractAddress;

    console.log("\n" + "=".repeat(60));
    console.log("✓ DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log(`\n📝 Contract Address: ${contractAddress}\n`);

    const info = {
      contractAddress,
      deployedAt: new Date().toISOString()
    };

    fs.writeFileSync("deployment.json", JSON.stringify(info, null, 2));
    console.log("✓ Deployment info saved to deployment.json");
    console.log("=".repeat(60) + "\n");

    await wallet.close();
  } catch (error) {
    console.error("\n✗ Deployment failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);