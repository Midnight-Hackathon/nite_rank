import { TESTNET_CONFIG } from "./config.js";

/**
 * Fetch transaction details from Midnight testnet using transaction hash or identifier
 * @param txHash - The transaction hash or identifier to fetch
 * @returns Transaction details or null if not found
 */
export async function fetchTransaction(txHash: string) {
  // First try with hash
  let query = `
    query GetTransaction {
      transactions(offset: { hash: "${txHash}" }) {
        hash
        protocolVersion
        merkleTreeRoot
        block {
          height
          hash
        }
        identifiers
        raw
        contractActions {
          __typename
          ... on ContractDeploy {
            address
            state
            chainState
          }
          ... on ContractCall {
            address
            state
            entryPoint
            chainState
          }
          ... on ContractUpdate {
            address
            state
            chainState
          }
        }
      }
    }
  `;

  try {
    let response = await fetch(TESTNET_CONFIG.indexer, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors with hash:', result.errors);
      // If hash fails, try with identifier
      console.log('Trying with identifier instead...');
      query = `
        query GetTransaction {
          transactions(offset: { identifier: "${txHash}" }) {
            hash
            protocolVersion
            merkleTreeRoot
            block {
              height
              hash
            }
            identifiers
            raw
            contractActions {
              __typename
              ... on ContractDeploy {
                address
                state
                chainState
              }
              ... on ContractCall {
                address
                state
                entryPoint
                chainState
              }
              ... on ContractUpdate {
                address
                state
                chainState
              }
            }
          }
        }
      `;

      response = await fetch(TESTNET_CONFIG.indexer, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      result = await response.json();

      if (result.errors) {
        console.error('GraphQL errors with identifier:', result.errors);
        return null;
      }
    }

    const transactions = result.data?.transactions || [];
    return transactions.length > 0 ? transactions[0] : null;

  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

/**
 * Fetch transaction details and display them in a readable format
 * @param txHash - The transaction ID to fetch and display
 */
export async function displayTransaction(txHash: string) {
  console.log(`Fetching transaction: ${txHash}\n`);

  try {
    const tx = await fetchTransaction(txHash);

    if (!tx) {
      console.log('Transaction not found');
      return;
    }

    console.log('Transaction Details:');
    console.log('='.repeat(60));
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(`Protocol Version: ${tx.protocolVersion}`);
    console.log(`Merkle Tree Root: ${tx.merkleTreeRoot}`);

    if (tx.block) {
      console.log('\nBlock Information:');
      console.log(`Block Height: ${tx.block.height}`);
      console.log(`Block Hash: ${tx.block.hash}`);
    }

    if (tx.identifiers && tx.identifiers.length > 0) {
      console.log('\nTransaction Identifiers:');
      tx.identifiers.forEach((id: string, index: number) => {
        console.log(`  ${index + 1}. ${id}`);
      });
    }

    if (tx.contractActions && tx.contractActions.length > 0) {
      console.log('\nContract Actions:');
      tx.contractActions.forEach((action: any, index: number) => {
        console.log(`  ${index + 1}. Type: ${action.__typename}`);
        console.log(`     Address: ${action.address}`);

        if (action.__typename === 'ContractCall') {
          console.log(`     Entry Point: ${action.entryPoint}`);
        }

        if (action.state) {
          console.log(`     State: ${action.state.substring(0, 100)}${action.state.length > 100 ? '...' : ''}`);
        }

        if (action.chainState) {
          console.log(`     Chain State: ${action.chainState.substring(0, 100)}${action.chainState.length > 100 ? '...' : ''}`);
        }
      });
    }

    if (tx.raw) {
      console.log('\n� Raw Transaction Data:');
      console.log(`Length: ${tx.raw.length} bytes`);
      // Show first 200 characters of raw data
      console.log(`Preview: ${tx.raw.substring(0, 200)}${tx.raw.length > 200 ? '...' : ''}`);
    }

  } catch (error) {
    console.error('Failed to fetch transaction:', error instanceof Error ? error.message : String(error));
  }
}

// CLI usage - only run when this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, txHash] = process.argv;
  if (!txHash) {
    console.error('Usage: node utils/fetchTransaction.js <transaction-id>');
    console.error('Example: node utils/fetchTransaction.js 00000000b9b1e05bd47325dd1280c1135deff87478c63a924b5d904543346488b927c650');
    process.exit(1);
  }

  displayTransaction(txHash);
}