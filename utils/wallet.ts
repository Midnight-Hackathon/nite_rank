import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { getZswapNetworkId, getLedgerNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import { nativeToken } from "@midnight-ntwrk/ledger";
import * as Rx from "rxjs";
import * as fs from "fs";
import * as path from "path";
import { TESTNET_CONFIG } from "./config.js";

/**
 * Validates a wallet seed string
 * @param seed - The seed to validate
 * @returns true if valid, false otherwise
 */
export function isValidSeed(seed: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(seed);
}

/**
 * Builds and syncs a wallet
 * @param walletSeed - 64-character hex seed
 * @returns A synced and started wallet
 */
export async function buildAndSyncWallet(walletSeed: string) {
  if (!isValidSeed(walletSeed)) {
    throw new Error("Invalid wallet seed: Must be 64 hex characters");
  }

  console.log("Building wallet...");
  const wallet = await WalletBuilder.build(
    TESTNET_CONFIG.indexer,
    TESTNET_CONFIG.indexerWS,
    TESTNET_CONFIG.proofServer,
    TESTNET_CONFIG.node,
    walletSeed,
    getZswapNetworkId(),
    "info"
  );

  wallet.start();

  console.log("Syncing wallet...");
  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.filter((s) => s.syncProgress?.synced === true),
      Rx.tap(() => console.log("Wallet synced!"))
    )
  );

  return wallet;
}

/**
 * Creates a wallet provider for contract interactions
 * @param wallet - The initialized wallet
 * @returns Wallet provider object with required methods
 */
export async function createWalletProvider(wallet: any) {
  const walletState: any = await Rx.firstValueFrom(wallet.state());

  return {
    coinPublicKey: walletState.coinPublicKey,
    encryptionPublicKey: walletState.encryptionPublicKey,
    balanceTx(tx: any, newCoins: any) {
      return wallet
        .balanceTransaction(
          ZswapTransaction.deserialize(
            tx.serialize(getLedgerNetworkId()),
            getZswapNetworkId()
          ),
          newCoins
        )
        .then((tx: any) => wallet.proveTransaction(tx))
        .then((zswapTx: any) =>
          Transaction.deserialize(
            zswapTx.serialize(getZswapNetworkId()),
            getLedgerNetworkId()
          )
        )
        .then(createBalancedTx);
    },
    submitTx(tx: any) {
      return wallet.submitTransaction(tx);
    }
  };
}

/**
 * Waits for wallet to receive funds
 * @param wallet - The wallet to monitor
 * @returns Promise that resolves when wallet receives funds
 */
export const waitForFunds = (wallet: Wallet) =>
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
 * @param seed - The wallet seed to save
 */
export function saveWalletSeedToEnv(seed: string) {
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
