import { NetworkId, setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { WebSocket } from "ws";

// Fix WebSocket for Node.js
// @ts-ignore: WebSocket needs to be added to globalThis for Midnight SDK compatibility
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

export const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300"
};

export { NetworkId, setNetworkId };
