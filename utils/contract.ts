import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import * as path from "path";
import * as fs from "fs";
import { TESTNET_CONFIG } from "./config.js";
import { createWalletProvider } from "./wallet.js";

export interface DeploymentInfo {
  contractAddress: string;
  deployedAt: string;
}

/**
 * Loads deployment information from deployment.json
 * @returns Deployment info or null if not found
 */
export function loadDeploymentInfo(): DeploymentInfo | null {
  if (!fs.existsSync("deployment.json")) {
    return null;
  }
  return JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
}

/**
 * Loads the compiled contract module
 * @returns The contract module and its path
 */
export async function loadContractModule() {
  const contractPath = path.join(process.cwd(), "contracts");
  const contractModulePath = path.join(
    contractPath,
    "managed",
    "aseryx",
    "contract",
    "index.cjs"
  );

  if (!fs.existsSync(contractModulePath)) {
    throw new Error("Contract not compiled! Run: npm run compile");
  }

  const AseryxModule = await import(contractModulePath);
  return { AseryxModule, contractPath };
}

/**
 * Initializes contract providers
 * @param contractPath - Path to the contract directory
 * @param wallet - The initialized wallet
 * @returns Configured providers object
 */
export async function initializeProviders(contractPath: string, wallet: any) {
  const walletProvider = await createWalletProvider(wallet);
  const zkConfigPath = path.join(contractPath, "managed", "aseryx");

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: "aseryx-state"
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
}

/**
 * Connects to a deployed contract
 * @param providers - Initialized providers
 * @param contractAddress - Address of the deployed contract
 * @param contractInstance - Instance of the contract
 * @returns Connected contract instance
 */
export async function connectToContract(
  providers: any,
  contractAddress: string,
  contractInstance: any
) {
  return await findDeployedContract(providers, {
    contractAddress,
    contract: contractInstance,
    privateStateId: "aseryxState",
    initialPrivateState: {}
  });
}

/**
 * Reads entry data from the contract ledger state
 * @param providers - Initialized providers
 * @param contractAddress - Address of the deployed contract
 * @param AseryxModule - The contract module
 * @param entryId - The entry ID to look up
 * @returns The encrypted data for the entry or null
 */
export async function getEntryData(
  providers: any,
  contractAddress: string,
  AseryxModule: any,
  entryId: number
): Promise<Uint8Array | null> {
  const state = await providers.publicDataProvider.queryContractState(
    contractAddress
  );
  
  if (state && state.data) {
    const ledger = AseryxModule.ledger(state.data);
    if (ledger.data_entries.member(BigInt(entryId))) {
      return ledger.data_entries.lookup(BigInt(entryId));
    }
  }
  
  return null;
}

/**
 * Gets the total number of entries in the contract
 * @param providers - Initialized providers
 * @param contractAddress - Address of the deployed contract
 * @param AseryxModule - The contract module
 * @returns The total number of entries
 */
export async function getTotalEntries(
  providers: any,
  contractAddress: string,
  AseryxModule: any
): Promise<bigint> {
  const state = await providers.publicDataProvider.queryContractState(
    contractAddress
  );
  
  if (state && state.data) {
    const ledger = AseryxModule.ledger(state.data);
    return ledger.total_entries;
  }
  
  return 0n;
}
