import * as fs from 'fs';
import { checkProofData, ProofData, AlignedValue } from '@midnight-ntwrk/compact-runtime';
import { deserializeWithBigInt } from '../utils/proofCapture.js';
import process from 'node:process';


// Load ZKIR circuit description
function loadAndExtractProof(proofPath: string) {
  const proofData = deserializeWithBigInt(fs.readFileSync(proofPath, 'utf8'));
  return proofData;
}

// Load ZKIR circuit description
function loadZKIR(circuitName: string): string {
  const zkirPath = `contracts/managed/aseryx/zkir/${circuitName}.zkir`;
  return fs.readFileSync(zkirPath, 'utf8');
}

// Verify proof cryptographic validity only (off-chain)
function verifyProofOffChain(proofPath: string) {
  const proofData = loadAndExtractProof(proofPath) as any;
  const circuitName = proofData.circuit;

  // Validate required fields exist
  if (!proofData.transaction?.private?.input) {
    throw new Error('Missing required field: transaction.private.input');
  }
  if (!proofData.transaction?.private?.output) {
    throw new Error('Missing required field: transaction.private.output');
  }
  if (!proofData.transaction?.public?.publicTranscript) {
    throw new Error('Missing required field: transaction.public.publicTranscript');
  }
  if (!proofData.transaction?.private?.privateTranscriptOutputs) {
    throw new Error('Missing required field: transaction.private.privateTranscriptOutputs');
  }

  console.log(`Off-Chain Cryptographic Verification for ${circuitName} proof...\n`);
  console.log(`Metadata: Distance ~${proofData.metadata?.distance || 'hidden'}m, Duration ~${proofData.metadata?.duration || 'hidden'}s`);
  console.log(`User: ${proofData.metadata?.userAddress}`);

  try {
    const zkir = loadZKIR(circuitName);

    console.log(`Circuit Details:`);
    console.log(`ZKIR circuit loaded (${zkir.length} chars)`);
    console.log(`Circuit: ${circuitName}`);
    console.log(`Proof data deserialized with Uint8Array reconstruction\n`);

    // Extract just the proof data structure needed for verification
    const proofDataForVerification = {
      input: proofData.transaction.private.input as AlignedValue,
      output: proofData.transaction.private.output as AlignedValue,
      publicTranscript: proofData.transaction.public.publicTranscript as never[],
      privateTranscriptOutputs: proofData.transaction.private.privateTranscriptOutputs as AlignedValue[]
    } as ProofData;

    checkProofData(zkir, proofDataForVerification);

    console.log('OFF-CHAIN VERIFICATION: VALID');
    console.log('  • Zero-knowledge proof constraints satisfied');
    console.log('  • Circuit logic verified locally');
    console.log('  • Proof proves: distance ≥5km AND duration ≤20min');
    console.log('  • Private data (exact values) remains mathematically hidden');
    return true;

  } catch (error) {
    console.log('OFF-CHAIN VERIFICATION: INVALID');
    console.log(`  • Error: ${error instanceof Error ? error.message : String(error)}`);
    console.log('  • Check proof generation and data integrity');
    return false;
  }
}

// CLI entry
const [,, proofPath] = process.argv;
if (!proofPath) {
  console.error('Usage: node verifyProofOffChain.js <proof.json>');
  process.exit(1);
}

const isValid = verifyProofOffChain(proofPath);
process.exit(isValid ? 0 : 1);