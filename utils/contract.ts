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
  // Direct path to the compiled contract module, relative to project root
  const isInServer = process.cwd().endsWith('server');
  const contractModulePath = path.join(process.cwd(), isInServer ? ".." : "", "contracts", "managed", "aseryx", "contract", "index.cjs");
  const contractPath = path.join(process.cwd(), isInServer ? ".." : "", "contracts");

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
