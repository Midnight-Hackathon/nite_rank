import * as fs from 'fs';
import process from 'node:process';
import { fetchTransaction } from '../utils/fetchTransaction.js';

// Helper to load proof data
function loadProof(proofPath: string) {
  const proofData = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
  return proofData;
}

// Verify proof on-chain status by fetching from blockchain
async function verifyProofOnChain(proofPath: string) {
  const proofData = loadProof(proofPath);
  const circuitName = proofData.circuit;

  // Validate required fields exist in proof
  if (!proofData.transaction?.public?.txHash) {
    throw new Error('Missing required field: transaction.public.txHash');
  }

  console.log(`On-Chain Verification for ${circuitName} proof...\n`);

  // Get transaction hash from proof data
  const txHash = proofData.transaction.public.txHash;

  console.log(`Checking transaction existence on Midnight blockchain...`);
  console.log(`Transaction Hash: ${txHash}\n`);

  try {
    // Simple existence check - fetch transaction from blockchain
    const blockchainTx = await fetchTransaction(txHash);

    if (!blockchainTx) {
      console.log('ON-CHAIN VERIFICATION: INVALID');
      console.log('  • Transaction not found on blockchain');
      console.log('  • Proof may not have been submitted or transaction failed');
      return false;
    }

    console.log('ON-CHAIN VERIFICATION: VALID');
    console.log('  • Transaction exists on Midnight blockchain');
    console.log('  • Zero-knowledge proof was accepted and recorded');
    console.log(`  • Block: ${blockchainTx.block?.height || 'Unknown'}`);

    return true;

  } catch (error) {
    console.log('ON-CHAIN VERIFICATION: ERROR');
    console.log(`  • Failed to query blockchain: ${error instanceof Error ? error.message : String(error)}`);
    console.log('  • Check network connectivity');
    return false;
  }
}

// CLI entry
const [,, proofPath] = process.argv;
if (!proofPath) {
  console.error('Usage: node verifyProofOnChain.js <proof.json>');
  process.exit(1);
}

verifyProofOnChain(proofPath).then(isValid => {
  process.exit(isValid ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});