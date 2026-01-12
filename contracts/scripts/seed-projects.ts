import { ethers } from "hardhat";

async function main() {
  console.log("Seeding charity projects...\n");

  // Load deployment info
  const fs = require("fs");
  let registryAddress: string;

  try {
    const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json", "utf8"));
    registryAddress = deploymentInfo.contracts.CharityRegistry;
    console.log("Using CharityRegistry at:", registryAddress);
  } catch (error) {
    console.log("deployment-info.json not found. Please provide registry address:");
    console.log("Usage: REGISTRY_ADDRESS=0x... npx hardhat run scripts/seed-projects.ts --network <network>");

    if (process.env.REGISTRY_ADDRESS) {
      registryAddress = process.env.REGISTRY_ADDRESS;
      console.log("Using CharityRegistry at:", registryAddress);
    } else {
      throw new Error("Registry address not found");
    }
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Seeding with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Get CharityRegistry contract
  const CharityRegistry = await ethers.getContractFactory("CharityRegistry");
  const registry = CharityRegistry.attach(registryAddress);

  // Sample charity projects
  const projects = [
    {
      name: "Clean Water Initiative",
      description: "Providing clean drinking water to communities in need. Building wells and water purification systems in rural areas.",
      wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account #1
    },
    {
      name: "Education for All",
      description: "Supporting education programs for underprivileged children. Providing school supplies, books, and scholarships.",
      wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account #2
    },
    {
      name: "Global Food Bank",
      description: "Fighting hunger by distributing food to families in need. Operating food banks and meal programs worldwide.",
      wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Hardhat account #3
    },
    {
      name: "Healthcare Access Fund",
      description: "Improving healthcare access in underserved communities. Funding medical supplies, clinics, and health education.",
      wallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Hardhat account #4
    },
    {
      name: "Climate Action Project",
      description: "Supporting environmental conservation and climate action initiatives. Tree planting, renewable energy, and sustainability programs.",
      wallet: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", // Hardhat account #5
    },
  ];

  console.log(`Creating ${projects.length} charity projects...\n`);

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`Creating project ${i + 1}/${projects.length}: ${project.name}`);

    try {
      const tx = await registry.createProject(
        project.name,
        project.description,
        project.wallet
      );
      await tx.wait();
      console.log(`✓ Project created successfully\n`);
    } catch (error: any) {
      console.error(`✗ Failed to create project: ${error.message}\n`);
    }
  }

  // Verify projects were created
  console.log("Verifying created projects...");
  const totalProjects = await registry.getTotalProjects();
  console.log(`Total projects in registry: ${totalProjects}`);

  const activeProjects = await registry.getAllActiveProjects();
  console.log(`Active projects: ${activeProjects.length}\n`);

  console.log("=== Created Projects ===");
  for (let i = 0; i < activeProjects.length; i++) {
    const project = activeProjects[i];
    console.log(`\nProject #${project.id}:`);
    console.log(`  Name: ${project.name}`);
    console.log(`  Description: ${project.description}`);
    console.log(`  Wallet: ${project.wallet}`);
    console.log(`  Total Received: ${ethers.formatEther(project.totalReceived)} MNEE`);
    console.log(`  Active: ${project.active}`);
  }

  console.log("\n✓ Seeding complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
