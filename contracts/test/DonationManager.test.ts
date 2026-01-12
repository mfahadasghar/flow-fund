import { expect } from "chai";
import { ethers } from "hardhat";
import { MockMNEE, CharityRegistry, DonationManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DonationManager", function () {
  let mnee: MockMNEE;
  let registry: CharityRegistry;
  let donationManager: DonationManager;
  let owner: SignerWithAddress;
  let donor1: SignerWithAddress;
  let donor2: SignerWithAddress;
  let project1Wallet: SignerWithAddress;
  let project2Wallet: SignerWithAddress;
  let project3Wallet: SignerWithAddress;

  const MINT_AMOUNT = ethers.parseEther("10000"); // 10,000 MNEE
  const DONATION_AMOUNT = ethers.parseEther("1000"); // 1,000 MNEE

  beforeEach(async function () {
    [owner, donor1, donor2, project1Wallet, project2Wallet, project3Wallet] =
      await ethers.getSigners();

    // Deploy MockMNEE
    const MockMNEE = await ethers.getContractFactory("MockMNEE");
    mnee = await MockMNEE.deploy();

    // Deploy CharityRegistry
    const CharityRegistry = await ethers.getContractFactory("CharityRegistry");
    registry = await CharityRegistry.deploy();

    // Deploy DonationManager
    const DonationManager = await ethers.getContractFactory("DonationManager");
    donationManager = await DonationManager.deploy(
      await mnee.getAddress(),
      await registry.getAddress()
    );

    // Create test projects
    await registry.createProject(
      "Project 1",
      "Description 1",
      project1Wallet.address
    );
    await registry.createProject(
      "Project 2",
      "Description 2",
      project2Wallet.address
    );
    await registry.createProject(
      "Project 3",
      "Description 3",
      project3Wallet.address
    );

    // Mint tokens to donors
    await mnee.mint(donor1.address, MINT_AMOUNT);
    await mnee.mint(donor2.address, MINT_AMOUNT);
  });

  describe("Deployment", function () {
    it("Should set the correct MNEE token address", async function () {
      expect(await donationManager.mneeToken()).to.equal(await mnee.getAddress());
    });

    it("Should set the correct CharityRegistry address", async function () {
      expect(await donationManager.charityRegistry()).to.equal(
        await registry.getAddress()
      );
    });

    it("Should start with zero total donated", async function () {
      expect(await donationManager.totalDonated()).to.equal(0);
    });
  });

  describe("Donations", function () {
    it("Should allow donation to a single project (100%)", async function () {
      // Approve MNEE spending
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      // Donate 100% to project 0
      const tx = await donationManager
        .connect(donor1)
        .donate([0], [10000], DONATION_AMOUNT);

      await expect(tx)
        .to.emit(donationManager, "DonationMade")
        .withArgs(0, donor1.address, DONATION_AMOUNT, [0], [DONATION_AMOUNT], anyValue);

      // Check project wallet received funds
      expect(await mnee.balanceOf(project1Wallet.address)).to.equal(DONATION_AMOUNT);

      // Check total donated
      expect(await donationManager.totalDonated()).to.equal(DONATION_AMOUNT);
      expect(await donationManager.donorTotalDonated(donor1.address)).to.equal(
        DONATION_AMOUNT
      );
    });

    it("Should allow donation to multiple projects with equal split", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      // Donate 50% to each of 2 projects
      const tx = await donationManager
        .connect(donor1)
        .donate([0, 1], [5000, 5000], DONATION_AMOUNT);

      const halfAmount = DONATION_AMOUNT / 2n;

      await expect(tx)
        .to.emit(donationManager, "DonationMade");

      // Check both project wallets received funds
      expect(await mnee.balanceOf(project1Wallet.address)).to.equal(halfAmount);
      expect(await mnee.balanceOf(project2Wallet.address)).to.equal(halfAmount);
    });

    it("Should allow donation to multiple projects with unequal split", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      // Donate 70% to project 0, 30% to project 1
      await donationManager
        .connect(donor1)
        .donate([0, 1], [7000, 3000], DONATION_AMOUNT);

      const amount1 = (DONATION_AMOUNT * 7000n) / 10000n;
      const amount2 = (DONATION_AMOUNT * 3000n) / 10000n;

      expect(await mnee.balanceOf(project1Wallet.address)).to.equal(amount1);
      expect(await mnee.balanceOf(project2Wallet.address)).to.equal(amount2);
    });

    it("Should handle three-way split correctly", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      // 50% to project 0, 30% to project 1, 20% to project 2
      await donationManager
        .connect(donor1)
        .donate([0, 1, 2], [5000, 3000, 2000], DONATION_AMOUNT);

      const amount1 = (DONATION_AMOUNT * 5000n) / 10000n;
      const amount2 = (DONATION_AMOUNT * 3000n) / 10000n;
      const amount3 = (DONATION_AMOUNT * 2000n) / 10000n;

      expect(await mnee.balanceOf(project1Wallet.address)).to.equal(amount1);
      expect(await mnee.balanceOf(project2Wallet.address)).to.equal(amount2);
      expect(await mnee.balanceOf(project3Wallet.address)).to.equal(amount3);
    });

    it("Should revert if percentages don't sum to 100%", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      await expect(
        donationManager.connect(donor1).donate([0, 1], [6000, 3000], DONATION_AMOUNT)
      ).to.be.revertedWith("Percentages must sum to 100%");
    });

    it("Should revert if arrays have different lengths", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      await expect(
        donationManager.connect(donor1).donate([0, 1], [10000], DONATION_AMOUNT)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("Should revert if amount is zero", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      await expect(
        donationManager.connect(donor1).donate([0], [10000], 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if project doesn't exist", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      await expect(
        donationManager.connect(donor1).donate([99], [10000], DONATION_AMOUNT)
      ).to.be.revertedWith("Project does not exist or is inactive");
    });

    it("Should revert if project is inactive", async function () {
      // Deactivate project 0
      await registry.deactivateProject(0);

      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);

      await expect(
        donationManager.connect(donor1).donate([0], [10000], DONATION_AMOUNT)
      ).to.be.revertedWith("Project does not exist or is inactive");
    });

    it("Should revert if insufficient allowance", async function () {
      // Don't approve or approve less than needed
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT / 2n);

      await expect(
        donationManager.connect(donor1).donate([0], [10000], DONATION_AMOUNT)
      ).to.be.reverted;
    });
  });

  describe("Donation Tracking", function () {
    beforeEach(async function () {
      // Make a donation
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);
      await donationManager.connect(donor1).donate([0, 1], [6000, 4000], DONATION_AMOUNT);
    });

    it("Should correctly track donation by ID", async function () {
      const donation = await donationManager.getDonation(0);

      expect(donation.id).to.equal(0);
      expect(donation.donor).to.equal(donor1.address);
      expect(donation.totalAmount).to.equal(DONATION_AMOUNT);
      expect(donation.projectIds.length).to.equal(2);
      expect(donation.projectIds[0]).to.equal(0);
      expect(donation.projectIds[1]).to.equal(1);
    });

    it("Should track donations by donor", async function () {
      const donorDonations = await donationManager.getDonationsByDonor(donor1.address);
      expect(donorDonations.length).to.equal(1);
      expect(donorDonations[0]).to.equal(0);

      // Make another donation
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);
      await donationManager.connect(donor1).donate([0], [10000], DONATION_AMOUNT);

      const updatedDonorDonations = await donationManager.getDonationsByDonor(donor1.address);
      expect(updatedDonorDonations.length).to.equal(2);
    });

    it("Should track donations by project", async function () {
      const projectDonations = await donationManager.getDonationsByProject(0);
      expect(projectDonations.length).to.equal(1);
      expect(projectDonations[0]).to.equal(0);
    });

    it("Should track donor statistics", async function () {
      const [donationCount, totalDonated] = await donationManager.getDonorStats(donor1.address);

      expect(donationCount).to.equal(1);
      expect(totalDonated).to.equal(DONATION_AMOUNT);
    });

    it("Should track total donations across all donors", async function () {
      // donor2 makes a donation
      await mnee.connect(donor2).approve(await donationManager.getAddress(), DONATION_AMOUNT);
      await donationManager.connect(donor2).donate([0], [10000], DONATION_AMOUNT);

      expect(await donationManager.totalDonated()).to.equal(DONATION_AMOUNT * 2n);
      expect(await donationManager.getTotalDonations()).to.equal(2);
    });
  });

  describe("Integration with CharityRegistry", function () {
    it("Should update project totalReceived in registry", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);
      await donationManager.connect(donor1).donate([0], [10000], DONATION_AMOUNT);

      const project = await registry.getProject(0);
      expect(project.totalReceived).to.equal(DONATION_AMOUNT);
    });

    it("Should correctly update multiple projects in registry", async function () {
      await mnee.connect(donor1).approve(await donationManager.getAddress(), DONATION_AMOUNT);
      await donationManager.connect(donor1).donate([0, 1], [6000, 4000], DONATION_AMOUNT);

      const project1 = await registry.getProject(0);
      const project2 = await registry.getProject(1);

      const amount1 = (DONATION_AMOUNT * 6000n) / 10000n;
      const amount2 = (DONATION_AMOUNT * 4000n) / 10000n;

      expect(project1.totalReceived).to.equal(amount1);
      expect(project2.totalReceived).to.equal(amount2);
    });
  });
});

// Helper for matching any value in events
const anyValue = undefined;
