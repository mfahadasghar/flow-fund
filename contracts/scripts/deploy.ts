import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy MockMNEE
  console.log("Deploying MockMNEE...");
  const MockMNEE = await ethers.getContractFactory("MockMNEE");
  const mnee = await MockMNEE.deploy();
  await mnee.waitForDeployment();
  const mneeAddress = await mnee.getAddress();
  console.log("MockMNEE deployed to:", mneeAddress);

  // Deploy CharityRegistry
  console.log("\nDeploying CharityRegistry...");
  const CharityRegistry = await ethers.getContractFactory("CharityRegistry");
  const registry = await CharityRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("CharityRegistry deployed to:", registryAddress);

  // Deploy DonationManager
  console.log("\nDeploying DonationManager...");
  const DonationManager = await ethers.getContractFactory("DonationManager");
  const donationManager = await DonationManager.deploy(mneeAddress, registryAddress);
  await donationManager.waitForDeployment();
  const donationManagerAddress = await donationManager.getAddress();
  console.log("DonationManager deployed to:", donationManagerAddress);

  // Grant registry permission to DonationManager (if needed)
  console.log("\nGranting permissions...");
  // Note: CharityRegistry.recordFundsReceived can be called by anyone
  // In production, you might want to restrict this to only DonationManager
  console.log("Permissions configured");

  // Print summary
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("MockMNEE:", mneeAddress);
  console.log("CharityRegistry:", registryAddress);
  console.log("DonationManager:", donationManagerAddress);

  console.log("\n=== Next Steps ===");
  console.log("1. Update frontend/.env.local with the contract addresses above");
  console.log("2. Run 'npx hardhat run scripts/seed-projects.ts --network <network>' to create sample projects");
  console.log("3. Verify contracts on Etherscan (if deploying to testnet/mainnet):");
  console.log(`   npx hardhat verify --network <network> ${mneeAddress}`);
  console.log(`   npx hardhat verify --network <network> ${registryAddress}`);
  console.log(`   npx hardhat verify --network <network> ${donationManagerAddress} ${mneeAddress} ${registryAddress}`);

  // Save deployment info to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contracts: {
      MockMNEE: mneeAddress,
      CharityRegistry: registryAddress,
      DonationManager: donationManagerAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
