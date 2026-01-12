# FlowFund - Smart Charity & Donation Platform

A blockchain-based charity donation platform where donors contribute MNEE stablecoin to charity projects with automatic fund allocation and transparent on-chain tracking.

## Features

- **Blockchain Transparency**: All donations recorded on Ethereum blockchain
- **Automatic Fund Allocation**: Smart contracts distribute funds based on user-defined percentages
- **Multi-Project Donations**: Support multiple charities in a single transaction
- **Real-time Dashboard**: Track donation history and view allocation breakdown
- **MNEE Stablecoin**: Stable value donations with low fees
- **MetaMask Integration**: Easy wallet connection and transaction signing

## Tech Stack

### Smart Contracts
- **Solidity 0.8.20**: Smart contract language
- **Hardhat**: Development environment
- **OpenZeppelin**: Secure, tested contract libraries
- **Ethers.js**: Web3 library

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **Recharts**: Data visualization
- **ethers.js v6**: Blockchain interaction

## Project Structure

```
FlowFund/
├── contracts/                 # Smart contracts
│   ├── contracts/
│   │   ├── MockMNEE.sol       # ERC20 test token
│   │   ├── CharityRegistry.sol # Project management
│   │   └── DonationManager.sol # Core donation logic
│   ├── scripts/
│   │   ├── deploy.ts          # Deployment script
│   │   └── seed-projects.ts   # Create sample projects
│   ├── test/                  # Contract tests
│   └── hardhat.config.ts
│
└── frontend/                  # Next.js application
    ├── app/                   # Pages (landing, donate, dashboard, projects)
    ├── components/            # React components
    ├── hooks/                 # Custom hooks
    ├── context/               # React context (WalletContext)
    └── lib/                   # Contract ABIs and addresses
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MetaMask browser extension
- Sepolia testnet ETH (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd FlowFund
```

2. **Install dependencies**
```bash
npm run install:all
# OR install individually:
# cd contracts && npm install
# cd ../frontend && npm install
```

3. **Set up environment variables**

**Contracts** (`contracts/.env`):
```bash
cp contracts/.env.example contracts/.env
```

Edit `contracts/.env`:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_deployer_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Frontend** (`frontend/.env.local`):
```bash
cp frontend/.env.example frontend/.env.local
```

> Note: Contract addresses will be filled in after deployment

## Development Workflow

### Option 1: Local Development (Hardhat Node)

1. **Start local blockchain** (Terminal 1)
```bash
cd contracts
npx hardhat node
```

2. **Deploy contracts to local node** (Terminal 2)
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/seed-projects.ts --network localhost
```

3. **Update frontend environment variables**

Copy contract addresses from deployment output to `frontend/.env.local`:
```
NEXT_PUBLIC_MNEE_ADDRESS=0x...
NEXT_PUBLIC_CHARITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_DONATION_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_ETHERSCAN_URL=http://localhost:8545
```

4. **Start frontend** (Terminal 3)
```bash
cd frontend
npm run dev
```

5. **Configure MetaMask for local network**
   - Network Name: Localhost
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH
   - Import one of the Hardhat accounts using the private key shown when you started the node

6. **Get test MNEE tokens**
   - Use the MockMNEE `mint()` function or create a faucet page

### Option 2: Sepolia Testnet Deployment

1. **Get Sepolia ETH**
   - Use a faucet: https://sepoliafaucet.com/

2. **Deploy to Sepolia**
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat run scripts/seed-projects.ts --network sepolia
```

3. **Verify contracts on Etherscan**
```bash
npx hardhat verify --network sepolia MNEE_ADDRESS
npx hardhat verify --network sepolia REGISTRY_ADDRESS
npx hardhat verify --network sepolia DONATION_MANAGER_ADDRESS MNEE_ADDRESS REGISTRY_ADDRESS
```

4. **Update frontend environment**

Copy addresses to `frontend/.env.local`:
```
NEXT_PUBLIC_MNEE_ADDRESS=0x...
NEXT_PUBLIC_CHARITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_DONATION_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_ETHERSCAN_URL=https://sepolia.etherscan.io
```

5. **Deploy frontend to Vercel**
```bash
cd frontend
vercel deploy --prod
```

## Testing

### Smart Contract Tests

```bash
cd contracts
npm test

# With coverage
npm run coverage
```

### Manual Frontend Testing

1. Connect wallet
2. Mint MNEE tokens (if using mock token)
3. Navigate to Donate page
4. Select projects and set allocation percentages
5. Enter donation amount
6. Complete 2-step transaction (Approve + Donate)
7. Check dashboard for donation history
8. Verify transaction on Etherscan

## Smart Contracts

### MockMNEE.sol
ERC20 token for testing. Has a public `mint()` function for easy token distribution.

### CharityRegistry.sol
Manages charity projects:
- `createProject(name, description, wallet)` - Create new project (owner only)
- `getAllActiveProjects()` - Get all active projects
- `getProject(id)` - Get project details

### DonationManager.sol
Core donation logic:
- `donate(projectIds[], percentages[], totalAmount)` - Make donation with allocation
- `getDonationsByDonor(address)` - Get donor's donation history
- `getDonorStats(address)` - Get donor statistics

**Donation Flow:**
1. User approves MNEE spending
2. User calls `donate()` with project IDs and percentage allocations
3. Contract validates percentages sum to 100% (10000 basis points)
4. Contract transfers MNEE and distributes to project wallets
5. Donation details stored on-chain
6. Events emitted for transparency

## Key Features Implementation

### Multi-Project Allocation
- Users select multiple projects
- Adjust percentage sliders for each
- System validates percentages sum to 100%
- Smart contract distributes funds automatically

### Transparency
- All transactions on-chain
- Etherscan links for verification
- Real-time balance updates
- Complete donation history

### Dashboard
- Total donated amount
- Number of donations
- Projects supported count
- Pie chart showing allocation breakdown
- Complete transaction history table

## Common Issues & Solutions

### Issue: "Please install MetaMask"
**Solution**: Install MetaMask browser extension

### Issue: "Wrong Network"
**Solution**: Switch to Sepolia (or localhost for local dev) in MetaMask

### Issue: "Insufficient MNEE balance"
**Solution**:
- Local: Call `mint()` function on MockMNEE contract
- Sepolia: Request MNEE from faucet or mint if you deployed the contract

### Issue: "Percentages must sum to 100%"
**Solution**: Click "Normalize to 100%" button or adjust sliders manually

### Issue: Contract addresses not configured
**Solution**: Ensure `frontend/.env.local` has all contract addresses from deployment

## Migration to Production MNEE

When ready to use the real MNEE token on mainnet:

1. Update `contracts/scripts/deploy.ts` to use existing MNEE address instead of deploying MockMNEE
2. Deploy CharityRegistry and DonationManager to mainnet
3. Update `frontend/.env.local` with mainnet contract addresses
4. Change `NEXT_PUBLIC_CHAIN_ID` to `1` (Ethereum Mainnet)
5. Test thoroughly on testnet first!

## Future Enhancements

- [ ] Recurring donations with automation
- [ ] AI-powered allocation recommendations
- [ ] Project impact metrics and reporting
- [ ] Donor NFT receipts
- [ ] Gamification: badges, leaderboards
- [ ] The Graph integration for event indexing
- [ ] Mobile app (React Native)
- [ ] Multi-token support

## Security Considerations

- Smart contracts use OpenZeppelin libraries
- ReentrancyGuard on donation function
- Input validation for all parameters
- Comprehensive test coverage
- Etherscan verification for transparency

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

MIT

## Support

For issues or questions:
- Open a GitHub issue
- Contact the team

---

Built with ❤️ for transparent charity donations
