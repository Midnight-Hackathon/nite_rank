// server/submitProof.js   ←  NO InMemorySigner, NO CompactRuntime gymnastics
import express from 'express';
import cors from 'cors';
import { buildAndSyncWallet } from '../dist/utils/wallet.js';
import { loadContractModule, initializeProviders, connectToContract } from '../dist/utils/contract.js';
import deployment from '../deployment.json' with { type: 'json' };
import { createWitnesses } from '../dist/utils/witnesses.js';   // <-- your existing witness helper
import dotenv from 'dotenv';
import { bech32m } from 'bech32';
import * as Rx from 'rxjs';
dotenv.config({ path: '../.env' });

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/submit-proof', async (req, res) => {
  try {
    const { distance, duration } = req.body;

    console.log(`Received request: distance=${distance}, duration=${duration}`);

    const wallet = await buildAndSyncWallet(process.env.WALLET_SEED);

    const state = await Rx.firstValueFrom(wallet.state());
    const decoded = bech32m.decode(state.coinPublicKey);
    const userPk = new Uint8Array(bech32m.fromWords(decoded.words));

    console.log(`UserPk length: ${userPk.length}, type: ${typeof userPk}`);

    // Load contract module and create fresh instances
    const { AseryxModule, contractPath } = await loadContractModule();
    const witnesses = createWitnesses(distance, duration);
    const contractInstance = new AseryxModule.Contract(witnesses);

    const providers = await initializeProviders(contractPath, wallet);
    const deployed = await connectToContract(providers, deployment.contractAddress, contractInstance);

    console.log('About to call submitRunProof with userPk...');
    
    // Call submitRunProof with userPk
    const tx = await deployed.callTx.submitRunProof(userPk);

    console.log('Proof submitted:', tx.public.txId);
    
    await wallet.close();
    
    res.json({ success: true, txHash: tx.public.txId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));