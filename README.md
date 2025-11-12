# Aseryx - Zero-Knowledge Fitness Tracking on Midnight Network

A privacy-preserving fitness tracking application built on the Midnight Network using zero-knowledge proofs. Users can prove they completed runs meeting specific criteria (distance ≥ 5km, duration ≤ 20 minutes) without revealing their actual distance or duration values.

## What is Aseryx?

Aseryx enables fitness enthusiasts to:
- **Register** as verified users on the Midnight blockchain
- **Submit zero-knowledge proofs** of completed runs that meet criteria
- **Maintain privacy** - exact distance/duration remains hidden
- **Build verifiable fitness history** through cryptographic proofs
- **Share proofs** for auditing and verification purposes

The system uses zero-knowledge proofs to mathematically prove that a run meets the criteria without disclosing the actual measurements, ensuring user privacy while maintaining accountability.

## Project Structure

```
midnight/
├── contracts/
│   ├── aseryx.compact          # Main contract with ZK circuits
│   └── managed/                # Compiled contract artifacts (generated)
│       └── aseryx/
│           ├── compiler/       # Contract compilation info
│           ├── contract/       # Compiled contract module
│           ├── keys/           # Prover/verifier keys (generated)
│           └── zkir/           # ZK circuit descriptions (generated)
├── scripts/                    # Interactive CLI scripts
│   ├── createWallet.ts         # Wallet setup & funding
│   ├── deploy.ts               # Contract deployment
│   ├── register.ts             # User registration
│   └── submitProof.ts          # Run proof submission
├── utils/                      # Core utilities
│   ├── config.ts               # Network configuration
│   ├── wallet.ts               # Wallet management
│   ├── contract.ts             # Contract interaction
│   ├── witnesses.ts            # ZK witness functions
│   ├── proofCapture.ts         # Proof serialization/sharing
│   └── fetchTransaction.ts     # Blockchain transaction fetching
├── zk/                         # Proof verification tools
│   ├── verifyProofOffChain.ts  # Cryptographic proof verification
│   └── verifyProofOnChain.ts   # Blockchain transaction verification
├── proofs/                     # Saved proof files (generated)
├── midnight-level-db/          # Local blockchain state (generated)
├── dist/                       # Compiled TypeScript output (generated)
├── deployment.json             # Deployed contract info (generated)
├── .env                        # Wallet seed storage (generated, gitignored)
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- Docker (for proof server)
- Git

### 2. Setup Environment
```bash
# Clone and install
git clone <repository-url>
cd midnight
npm install

# Start proof server (in separate terminal)
npm run docker
```

### 3. Create Wallet
```bash
npm run create:wallet
```
This will:
- Generate or import a wallet seed
- Save it securely to `.env`
- Display your wallet address
- Optionally wait for testnet funding

### 4. Fund Wallet
Visit [Midnight Testnet Faucet](https://midnight.network/test-faucet) and send tDUST tokens to your wallet address.

### 5. Deploy Contract
```bash
npm run deploy
```

### 6. Register as User
```bash
npm run register
```

### 7. Submit Run Proof
```bash
npm run submit:proof
```

## Detailed Usage

### Wallet Management

#### Creating a New Wallet
```bash
npm run create:wallet
```

**Features:**
- Generates cryptographically secure 64-character hex seed
- Saves seed to `.env` file (automatically gitignored)
- Displays wallet address for funding
- Shows current balance
- Optional: Wait for incoming testnet tokens

### Contract Deployment

```bash
npm run deploy
```

**Requirements:**
- Wallet with sufficient tDUST tokens
- Running proof server (`npm run docker`)

**What it does:**
- Compiles the Aseryx contract
- Deploys to Midnight testnet
- Saves deployment info to `deployment.json` (contract address and deployment timestamp)
- Generates prover/verifier keys for ZK circuits

### User Registration

```bash
npm run register
```

**Purpose:** Register your wallet address as a verified Aseryx user.

**What happens:**
- Connects to deployed contract
- Registers your public key
- Enables you to submit run proofs

### Submitting Run Proofs

```bash
npm run submit:proof
```

**Current Implementation:** Uses hardcoded test values (6km distance, 1000s duration)

**What it does:**
- Creates zero-knowledge proof that distance ≥ 5km AND duration ≤ 20min
- Submits proof to contract without revealing actual values
- Saves proof data to `./proofs/` for sharing/auditing
- Updates user's verified run count on-chain

## Zero-Knowledge Proof System

### How It Works

1. **Private Data:** Distance and duration remain in user's local environment
2. **Witnesses:** Provide private values to ZK circuits during proof generation
3. **Proof Generation:** Creates cryptographic proof that criteria are met
4. **On-Chain Verification:** Contract verifies proof without seeing private data
5. **Public Transparency:** Only proof validity and user address are recorded

### ZK Circuits

#### `registerUser`
- **Input:** User public key
- **Output:** Registers user in `registeredUsers` mapping and initializes proof counter

#### `proveRunDistance`
- **Inputs:** Distance (Uint<32>), Duration (Uint<32>)
- **Logic:** `distance >= 5000 && duration <= 1200`
- **Output:** Boolean proof result

#### `submitRunProof`
- **Input:** User public key
- **Private Data:** Distance and duration (fetched from witnesses)
- **Logic:** Verifies user is registered + calls `proveRunDistance` with private data
- **Effects:** Increments user's proof count and global total

#### `getUserProofCount`
- **Input:** User public key
- **Output:** Returns the number of verified proofs submitted by the user

### Privacy Guarantees

- ✅ **Distance hidden:** Exact meters never revealed
- ✅ **Duration hidden:** Exact seconds never revealed
- ✅ **Route hidden:** GPS data never submitted
- ✅ **Time hidden:** When run occurred not recorded
- ✅ **Public verification:** Anyone can verify proof validity
- ✅ **Non-repudiation:** User cannot deny submitting proof

## Proof Verification

### Off-Chain Verification
Verify proof cryptography without blockchain interaction:

```bash
npm run verifyProof:offchain proofs/proof_submitRunProof_*.json
```

**Checks:**
- Zero-knowledge proof constraints satisfied
- Circuit logic verified locally
- Proof proves distance ≥5km AND duration ≤20min

### On-Chain Verification
Verify transaction was accepted by the network by querying the blockchain directly:

```bash
npm run verifyProof:onchain proofs/proof_submitRunProof_*.json
```

**Checks:**
- Fetches transaction directly from Midnight blockchain
- Verifies transaction exists and was processed
- Confirms contract call to `submitRunProof` was executed
- Validates transaction is recorded in blockchain history

### Fetch Transaction from Blockchain
Fetch detailed transaction information directly from the Midnight testnet:

```bash
npm run fetch:tx <transaction-hash>
```

**Example:**
```bash
npm run fetch:tx 6033544c2ae431e474da64ad93cc243ef93250ca513add8a53023292fc1aa5c3
```

**Displays:**
- Transaction hash and protocol version
- Block information (height, hash)
- Contract actions and entry points
- Raw transaction data
- Transaction identifiers

**Note:** Use the `txHash` field from proof files, not the `txId` field.

## Proof File Storage

When submitting run proofs, transaction data including the zero-knowledge proof is automatically saved to the `./proofs/` directory. Each proof file contains:

- **Circuit name** and **timestamp** of submission
- **User metadata** (address, distance, duration for reference)
- **Complete transaction data** including private and public transcripts
- **Transaction hash** for blockchain verification
- **Serialized proof data** for sharing and auditing

**Example proof filename:** `proof_submitRunProof_2025-11-12T22-20-16-501Z.json`

**Note:** Proof files contain sensitive cryptographic data and should be handled securely when sharing for verification purposes.

## Querying User Proof Counts

Query the number of verified proofs submitted by a specific user:

```typescript
import { AseryxModule } from './contracts/managed/aseryx/contract/index.cjs';
import { createContract } from './utils/contract.js';

// Create contract instance
const contract = await createContract(deploymentAddress);

// Query user's proof count
const userProofCount = await contract.getUserProofCount(userPublicKey);
console.log(`User has submitted ${userProofCount} verified proofs`);
```

**Note:** This is a read-only operation that doesn't require gas or create transactions.

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run docker` | Start proof server in Docker |
| `npm run compile` | Compile contract to managed directory |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run deploy` | Deploy contract to testnet |
| `npm run create:wallet` | Interactive wallet setup |
| `npm run register` | Register user with contract |
| `npm run submit:proof` | Submit run proof (currently hardcoded) |
| `npm run fetch:tx` | Fetch transaction details from blockchain |
| `npm run verifyProof:offchain` | Verify proof cryptography |
| `npm run verifyProof:onchain` | Verify blockchain transaction |

## Technical Architecture

### Contract State
- `registeredUsers`: Map of user addresses to registration status
- `userProofs`: Map of user addresses to verified proof counts
- `totalVerified`: Global counter of all verified runs

### Transaction Flow
1. User creates witnesses with private run data
2. Contract generates ZK proof using witness data
3. Proof submitted to network (only proof, not raw data)
4. Network verifies proof cryptographically
5. Success recorded on-chain, private data remains hidden

### Dependencies
- **@midnight-ntwrk/compact-runtime**: ZK proof generation
- **@midnight-ntwrk/wallet**: Wallet management
- **@midnight-ntwrk/midnight-js-***: Network providers
- **bech32**: Address encoding
- **ws**: WebSocket client

### Local Blockchain State
The `midnight-level-db/` directory contains a local LevelDB instance that caches blockchain state and transaction data. This provides:
- Faster subsequent queries for contract state
- Offline access to previously fetched data
- Synchronization with the Midnight testnet
- Persistent storage of wallet and contract interactions

## Development & Customization

### Modifying Run Criteria

Edit `contracts/aseryx.compact`:

```compact
const DistanceThreshold = 5000 as Uint<32>;  // 5km in meters
const DurationThreshold = 1200 as Uint<32>;  // 20 minutes in seconds
```

### Adding New Metrics

1. Add witness functions in `utils/witnesses.ts`
2. Update contract circuits
3. Modify proof submission logic

### Custom Proof Submission

Instead of hardcoded values, integrate with fitness APIs:

```typescript
// Example: Fetch from Strava API
const runData = await fetchStravaActivity(activityId);
const distance = runData.distance;  // meters
const duration = runData.moving_time;  // seconds

const contractInstance = new AseryxModule.Contract(
  createWitnesses(distance, duration)
);
```

## Security & Privacy

### Wallet Security
- 🔐 Seeds stored in `.env` (gitignored)
- 📝 Always backup seeds offline
- ⚠️ Never commit seeds to version control
- 🔄 Interactive prompts prevent accidental overwrites

### Zero-Knowledge Privacy
- **Cryptographic Proofs:** Mathematical guarantees of privacy
- **Minimal Disclosure:** Only proof validity revealed
- **Verifiable:** Anyone can verify without trusting the prover
- **Tamper-Proof:** Proofs are cryptographically bound to data

### Network Security
- Built on Midnight Network's privacy-preserving blockchain
- Zero-knowledge proofs prevent data leakage
- Transaction finality through consensus

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

### Common Issues

**"No wallet found"**
```bash
npm run create:wallet
```

**"Contract not deployed"**
```bash
npm run deploy
```

**"Insufficient funds"**
- Visit [Midnight Faucet](https://midnight.network/test-faucet)
- Send tDUST to your wallet address
- Wait for confirmation

**"Proof server not running"**
```bash
npm run docker
# Wait for "midnight-proof-server is ready" message
```

**"User not registered"**
```bash
npm run register
```

**"Run doesn't meet criteria"**
- Ensure distance ≥ 5000 meters (5km)
- Ensure duration ≤ 1200 seconds (20 minutes)

### Proof Verification Issues

**Off-chain verification fails:**
- Check proof file integrity
- Ensure ZKIR circuit files exist
- Verify proof server is running

**On-chain verification fails:**
- Check network connectivity to Midnight testnet
- Verify transaction hash in proof file is correct
- Ensure indexer API is accessible
- Confirm transaction was actually submitted to network

## Contributing

1. Test on Midnight testnet only
2. Use meaningful commit messages
3. Update documentation for API changes
4. Test proof verification thoroughly

## License

[Add license information]

---

**Built with ❤️ on the Midnight Network**

## Security Notes

- 🔐 Your wallet seed is stored in `.env` (gitignored by default)
- 📝 Always backup your seed in a secure location
- ⚠️ Never share your seed or commit it to version control
- 🔄 The wallet setup script protects against accidental overwrites