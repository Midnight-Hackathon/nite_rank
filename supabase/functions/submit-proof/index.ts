import { buildAndSyncWallet, isValidSeed } from '../../../backend/utils/wallet.ts';
import { loadDeploymentInfo, loadContractModule, initializeProviders, connectToContract } from '../../../backend/utils/contract.js';
import { saveTransactionProof } from '../../../backend/utils/proofCapture.ts';
import * as Rx from 'npm:rxjs';
import { bech32m } from 'npm:bech32';
import { createWitnesses } from '../../../backend/utils/witnesses.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { distance, duration } = await req.json();
    if (typeof distance !== 'number' || typeof duration !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid distance or duration' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    // Adapted from submitProof.ts
    const deployment = loadDeploymentInfo();
    if (!deployment) {
      return new Response(JSON.stringify({ error: 'No deployment.json found' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    const walletSeed = Deno.env.get('WALLET_SEED');
    if (!walletSeed || !isValidSeed(walletSeed)) {
      return new Response(JSON.stringify({ error: 'Invalid wallet seed' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    const wallet = await buildAndSyncWallet(walletSeed);
    const state = await Rx.firstValueFrom(wallet.state());
    const decoded = bech32m.decode(state.coinPublicKey);
    const userPk = new Uint8Array(bech32m.fromWords(decoded.words));

    const { AseryxModule, contractPath } = await loadContractModule();
    const contractInstance = new AseryxModule.Contract(createWitnesses(distance, duration));
    const providers = await initializeProviders(contractPath, wallet);
    const deployed = await connectToContract(providers, deployment.contractAddress, contractInstance);

    const tx = await deployed.callTx.submitRunProof(userPk);
    saveTransactionProof(tx, 'submitRunProof', { userAddress: state.address, distance, duration });

    await wallet.close();

    return new Response(JSON.stringify({ status: 'success', txId: tx.public.txId }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
});
