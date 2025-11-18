// server/submitProof.js   ←  NO InMemorySigner, NO CompactRuntime gymnastics
import express from 'express';
import cors from 'cors';
import { buildAndSyncWallet } from '../dist/utils/wallet.js';
import { loadContractModule, initializeProviders, connectToContract } from '../dist/utils/contract.js';
import deployment from '../deployment.json' with { type: 'json' };
import { createWitnesses } from '../dist/utils/witnesses.js';   // <-- your existing witness helper
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/submit-proof', async (req, res) => {
  try {
    const { distance, duration } = req.body;

    const wallet = await buildAndSyncWallet(process.env.WALLET_SEED);

    // This is exactly what your CLI scripts do
    const { AseryxModule, contractPath } = await loadContractModule();
    const witnesses = createWitnesses(distance, duration);
    const contractInstance = new AseryxModule.Contract(witnesses);

    const providers = await initializeProviders(contractPath, wallet);
    const deployed = await connectToContract(providers, deployment.contractAddress, contractInstance);

    // This is the exact same call your working submitProof.ts uses
    const tx = await deployed.callTx.submitRunProof();

    console.log('Proof submitted:', tx.public.txId);
    res.json({ success: true, txHash: tx.public.txId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));