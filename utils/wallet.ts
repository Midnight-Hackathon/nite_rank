import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { getZswapNetworkId, getLedgerNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import * as Rx from "rxjs";

/**
 * Testnet configuration
 */
const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300"
};

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
