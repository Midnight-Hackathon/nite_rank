import * as fs from "fs";
import * as path from "path";
import process from "node:process";

/**
 * Custom JSON serializer that handles BigInt and Uint8Array values
 */
function serializeWithBigInt(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    // Convert BigInt to string with suffix to indicate it was a BigInt
    if (typeof value === 'bigint') {
      return value.toString() + 'n';
    }
    // Explicitly handle Uint8Array by converting to array
    if (value instanceof Uint8Array) {
      return {
        __uint8array__: true,
        data: Array.from(value)
      };
    }
    return value;
  }, 2);
}

/**
 * Custom JSON deserializer that reconstructs Uint8Array values
 */
export function deserializeWithBigInt(json: string): unknown {
  return JSON.parse(json, (_key, value) => {
    // Reconstruct Uint8Array from marked objects
    if (typeof value === 'object' && value !== null && value.__uint8array__ === true) {
      return new Uint8Array(value.data);
    }
    return value;
  });
}

/**
 * Save transaction data (includes proof information) for sharing/auditing
 * This captures the transaction after proof generation but before blockchain submission
 */
export function saveTransactionProof(
  txData: unknown,
  circuit: string,
  metadata: Record<string, unknown> = {}
): string {
  const proofsDir = path.join(process.cwd(), "proofs");
  
  // Ensure directory exists
  if (!fs.existsSync(proofsDir)) {
    fs.mkdirSync(proofsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const proofFilename = `proof_${circuit}_${timestamp}.json`;
  const proofPath = path.join(proofsDir, proofFilename);
  
  // Extract only the data needed for verification to reduce file size
  const minimalTxData = extractVerificationData(txData);
  console.log(`Original txData size: ~${serializeWithBigInt(txData).length} chars`);
  console.log(`Minimal txData size: ~${serializeWithBigInt(minimalTxData).length} chars`);
  
  // Save proof data with BigInt handling
  const proofData = {
    circuit,
    timestamp: new Date().toISOString(),
    metadata,
    transaction: minimalTxData
  };
  
  fs.writeFileSync(proofPath, serializeWithBigInt(proofData));
  console.log(`✓ Proof data saved to: ${proofPath} (${fs.statSync(proofPath).size} bytes)`);
  
  return proofPath;
}

/**
 * Load a saved proof for verification or sharing
 */
export function loadProof(proofPath: string) {
  if (!fs.existsSync(proofPath)) {
    throw new Error(`Proof file not found: ${proofPath}`);
  }
  
  // Use the deserializer to properly reconstruct Uint8Arrays
  const proofData = deserializeWithBigInt(fs.readFileSync(proofPath, 'utf-8'));
  const proof = proofData as { circuit: string; timestamp: string };
  console.log(`\nLoaded proof:`);
  console.log(`  Circuit: ${proof.circuit}`);
  console.log(`  Generated: ${proof.timestamp}`);
  
  return proofData;
}

/**
 * List all saved proofs
 */
export function listProofs(): string[] {
  const proofsDir = path.join(process.cwd(), "proofs");
  
  if (!fs.existsSync(proofsDir)) {
    return [];
  }
  
  return fs.readdirSync(proofsDir)
    .filter(file => file.startsWith('proof_') && file.endsWith('.json'))
    .map(file => path.join(proofsDir, file));
}

/**
 * Extract only the data needed for proof verification to minimize file size
 */
function extractVerificationData(txData: any): any {
  if (!txData || typeof txData !== 'object') {
    return txData;
  }

  // Only keep the fields needed for verification
  return {
    private: {
      input: txData.private?.input,
      output: txData.private?.output,
      privateTranscriptOutputs: txData.private?.privateTranscriptOutputs
    },
    public: {
      publicTranscript: txData.public?.publicTranscript,
      status: txData.public?.status,
      txId: txData.public?.txId,
      txHash: txData.public?.txHash || txData.public?.hash, // Use txHash field
      blockHeight: txData.public?.blockHeight,
      blockHash: txData.public?.blockHash
    }
  };
}

