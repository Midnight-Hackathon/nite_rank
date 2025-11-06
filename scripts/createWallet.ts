import { buildAndSyncWallet, isValidSeed } from "../utils/wallet.js";
import { nativeToken } from "@midnight-ntwrk/ledger";
import { WebSocket } from "ws";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import * as Rx from "rxjs";
import * as dotenv from "dotenv";
import { NetworkId, setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { type Wallet } from "@midnight-ntwrk/wallet-api";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state) => {
        const balance = state.balances[nativeToken()] ?? 0n;
        if (state.syncProgress) {
          console.log(
            `Sync progress: synced=${state.syncProgress.synced}, balance=${balance} tDUST`
          );
        }
      }),
      Rx.filter((state) => state.syncProgress?.synced === true),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n),
      Rx.tap((balance) => console.log(`\n✓ Wallet funded with balance: ${balance} tDUST`)),
      Rx.take(1)
    )
  );

/**
 * Saves wallet seed to .env file
 */
function saveWalletSeedToEnv(seed: string) {
  const envPath = path.join(process.cwd(), ".env");
  let envContent = "";

  // Read existing .env if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Check if WALLET_SEED already exists
  if (envContent.includes("WALLET_SEED=")) {
    // Replace existing WALLET_SEED
    envContent = envContent.replace(/WALLET_SEED=.*/g, `WALLET_SEED=${seed}`);
  } else {
    // Add new WALLET_SEED
    envContent += `${envContent.length > 0 && !envContent.endsWith("\n") ? "\n" : ""}WALLET_SEED=${seed}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("\n✓ Wallet seed saved to .env file");
}

async function main() {
  console.log("=".repeat(60));
  console.log("Midnight Wallet Setup");
  console.log("=".repeat(60));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Check if wallet already exists
    dotenv.config();
    if (process.env.WALLET_SEED) {
      console.log("\n⚠️  A wallet seed already exists in your .env file.");
      console.log("Do you want to:");
      console.log("  1. Keep existing wallet");
      console.log("  2. Create new wallet (will overwrite)");
      console.log("  3. Import different wallet (will overwrite)\n");
      
      const overwrite = await rl.question("Enter choice (1-3): ");
      
      if (overwrite.trim() === "1") {
        const wallet = await buildAndSyncWallet(process.env.WALLET_SEED);
        const state = await Rx.firstValueFrom(wallet.state());
        console.log("\n✓ Keeping existing wallet configuration.");
        console.log(`Your existing wallet public key is: ${state.address}`);
        console.log(`Your wallet balance is: ${state.balances[nativeToken()] || 0n} tDUST`);
        await wallet.close();
        rl.close();
        return;
      }
      
      console.log("\n⚠️  This will overwrite your existing wallet seed!");
      const confirm = await rl.question("Are you sure? (y/n): ");
      
      if (confirm.toLowerCase() !== "y") {
        console.log("\n✓ Cancelled. Existing wallet preserved.");
        rl.close();
        return;
      }
    }

    console.log("\nDo you want to:");
    console.log("  1. Create a new wallet");
    console.log("  2. Import an existing wallet\n");

    const choice = await rl.question("Enter choice (1 or 2): ");

    let walletSeed: string;

    if (choice.trim() === "2") {
      // Import existing wallet
      console.log("\nEnter your 64-character hex wallet seed:");
      walletSeed = (await rl.question("")).trim();

      if (!isValidSeed(walletSeed)) {
        console.error("\n✗ Invalid wallet seed! Must be 64 hexadecimal characters.");
        process.exit(1);
      }

      console.log("\n✓ Valid wallet seed detected.");
    } else {
      // Create new wallet
      console.log("\n🔐 Generating new wallet seed...");
      const bytes = new Uint8Array(32);
      // @ts-ignore
      crypto.getRandomValues(bytes);
      walletSeed = Array.from(bytes, (b) =>
        b.toString(16).padStart(2, "0")
      ).join("");

      console.log("\n" + "=".repeat(60));
      console.log("⚠️  IMPORTANT: SAVE THIS SEED SECURELY!");
      console.log("=".repeat(60));
      console.log(`\n${walletSeed}\n`);
      console.log("This seed will be saved to your .env file, but you should");
      console.log("also store it somewhere secure as a backup.");
      console.log("=".repeat(60));

      const confirmed = await rl.question("\nHave you saved your seed? (y/n): ");
      if (confirmed.toLowerCase() !== "y") {
        console.log("\n✗ Please save your seed before continuing.");
        process.exit(0);
      }
    }

    // Save to .env file
    saveWalletSeedToEnv(walletSeed);

    // Build and sync wallet
    console.log("\n📡 Connecting to Midnight Testnet...");
    const wallet = await buildAndSyncWallet(walletSeed);

    const state = await Rx.firstValueFrom(wallet.state());
    console.log(`\n✓ Wallet address: ${state.address}`);

    const balance = state.balances[nativeToken()] || 0n;

    if (balance === 0n) {
      console.log(`\n💰 Wallet balance: 0 tDUST`);
      console.log("\n" + "=".repeat(60));
      console.log("NEXT STEPS:");
      console.log("=".repeat(60));
      console.log("1. Visit the Midnight testnet faucet:");
      console.log("   https://midnight.network/test-faucet");
      console.log(`\n2. Send test tokens to: ${state.address}`);
      console.log("\n3. Wait for tokens to arrive (this may take a few minutes)");
      console.log("=".repeat(60));

      const waitChoice = await rl.question("\nWait for funds now? (y/n): ");
      
      if (waitChoice.toLowerCase() === "y" || waitChoice.toLowerCase() === "yes") {
        console.log("\n⏳ Waiting to receive tokens...");
        console.log("(The wallet will continuously check for incoming funds)");
        await waitForFunds(wallet);
        // Note: success message already printed by waitForFunds
      }
    } else {
      console.log(`\n✓ Wallet balance: ${balance} tDUST`);
    }

    await wallet.close();

    console.log("\n" + "=".repeat(60));
    console.log("✓ WALLET SETUP COMPLETE!");
    console.log("=".repeat(60));
    console.log("\nYou can now run the deployment script:");
    console.log("  npm run deploy");
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n✗ Wallet setup failed:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
