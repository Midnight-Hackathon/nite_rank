# Midnight Hello World Contract

A modular setup for interacting with Midnight smart contracts, organized similarly to Hardhat projects.

## Project Structure

```
midnight/
├── contracts/              # Smart contracts
│   ├── hello-world.compact
│   └── managed/            # Compiled contract artifacts
│       └── hello-world/
├── scripts/                # Interaction scripts
│   ├── createWallet.ts     # Wallet creation & import
│   ├── deploy.ts           # Contract deployment
│   ├── cli.ts              # Interactive CLI (read & write)
│   ├── read.ts             # Read-only interactions
│   ├── write.ts            # Write interactions
├── utils/                  # Utility modules
│   ├── config.ts           # Network configuration
│   ├── wallet.ts           # Wallet utilities
│   └── contract.ts         # Contract utilities
├── dist/                   # Compiled JavaScript (generated)
├── deployment.json         # Deployed contract info (generated)
└── package.json
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the proof server (in a separate terminal)
```bash
docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'
```

### 3. Create or import wallet

Run the interactive wallet setup:
```bash
npm run create-wallet
```

#### What the wallet setup does:

**First Time Setup:**
```
============================================================
Midnight Wallet Setup
============================================================

Do you want to:
  1. Create a new wallet
  2. Import an existing wallet

Enter choice (1 or 2): 1

🔐 Generating new wallet seed...

============================================================
⚠️  IMPORTANT: SAVE THIS SEED SECURELY!
============================================================

a1b2c3d4e5f6...your_64_character_hex_seed...

This seed will be saved to your .env file, but you should
also store it somewhere secure as a backup.
============================================================

Have you saved your seed? (y/n): y

✓ Wallet seed saved to .env file

📡 Connecting to Midnight Testnet...

✓ Wallet address: 0x1234...abcd

💰 Wallet balance: 0 tDUST

============================================================
NEXT STEPS:
============================================================
1. Visit the Midnight testnet faucet:
   https://midnight.network/test-faucet

2. Send test tokens to: 0x1234...abcd

3. Wait for tokens to arrive (this may take a few minutes)
============================================================

Wait for funds now? (y/n): y

⏳ Waiting to receive tokens...
(The wallet will continuously check for incoming funds)
Sync progress: synced=true, balance=1000 tDUST

✓ Wallet funded with balance: 1000 tDUST

============================================================
✓ WALLET SETUP COMPLETE!
============================================================

You can now run the deployment script:
  npm run deploy
============================================================
```

**If Wallet Already Exists:**
```
⚠️  A wallet seed already exists in your .env file.
Do you want to:
  1. Keep existing wallet
  2. Create new wallet (will overwrite)
  3. Import different wallet (will overwrite)

Enter choice (1-3): 1

✓ Keeping existing wallet configuration.
Your existing wallet public key is: 0x1234...abcd
Your wallet balance is: 1000 tDUST
```

#### Options:
- **Create new wallet**: Generates a new 64-character hex seed
- **Import existing wallet**: Enter your existing 64-character hex seed
- **Keep existing wallet**: View current wallet info without changes

The script will:
- ✅ Save your wallet seed to `.env` file automatically
- ✅ Display your wallet address for receiving funds
- ✅ Check your current balance
- ✅ Optionally wait for incoming testnet tokens

### 4. Fund your wallet
- Visit https://midnight.network/test-faucet
- Send test tokens to your wallet address
- Or wait for funds during wallet setup (option provided)

## Usage

### Compile & Deploy

```bash
# Compile the contract
npm run compile

# Build TypeScript to JavaScript
npm run build

# Deploy the contract to Midnight Testnet
npm run deploy
```

**Note**: If you haven't created a wallet yet, the deploy script will prompt you to run `npm run create-wallet` first.

### Interact with Contract

```bash
# Interactive CLI - menu for read/write operations
npm run cli

# Read current message directly
npm run read

# Write new message directly
npm run write
```

## Utility Modules

The project uses modular utilities that can be imported into any script:

### `utils/config.ts`
- Network configuration (testnet endpoints)
- WebSocket setup

### `utils/wallet.ts`
- `isValidSeed()` - Validate wallet seed format
- `buildAndSyncWallet()` - Initialize and sync wallet
- `createWalletProvider()` - Create wallet provider for transactions

### `utils/contract.ts`
- `loadDeploymentInfo()` - Load deployment.json
- `loadContractModule()` - Load compiled contract
- `initializeProviders()` - Setup all providers
- `connectToContract()` - Connect to deployed contract
- `readCurrentMessage()` - Query contract state

## Creating Custom Interactions

Use the utilities to build custom scripts:

```typescript
import { buildAndSyncWallet } from "../utils/wallet.js";
import { loadDeploymentInfo, loadContractModule, initializeProviders } from "../utils/contract.js";

async function myCustomScript() {
  const deployment = loadDeploymentInfo();
  const wallet = await buildAndSyncWallet(walletSeed);
  const { HelloWorldModule, contractPath } = await loadContractModule();
  const providers = await initializeProviders(contractPath, wallet);
  
  // Your custom logic here
  
  await wallet.close();
}
```

See `scripts/example-custom.ts` for a complete template.

## Requirements

- Node.js 18+
- Docker (for proof server)
- Testnet tokens from https://midnight.network/test-faucet

## Configuration

The wallet configuration is stored in `.env` file (automatically created by `npm run create-wallet`):
```
WALLET_SEED=your_64_character_hex_seed_here
```

**⚠️ Important**: Never commit your `.env` file or share your wallet seed!

## Troubleshooting

**No wallet found**: Run `npm run create-wallet` first  
**Contract not found**: Run `npm run compile`  
**No deployment.json**: Run `npm run deploy` first  
**Wallet balance 0**: Get tokens from the faucet or use the "wait for funds" option  
**Build errors**: Run `npm install`  
**Wallet already exists**: Choose option 1 to keep it, or 2/3 to overwrite

## Security Notes

- 🔐 Your wallet seed is stored in `.env` (gitignored by default)
- 📝 Always backup your seed in a secure location
- ⚠️ Never share your seed or commit it to version control
- 🔄 The wallet setup script protects against accidental overwrites