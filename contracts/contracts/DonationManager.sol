// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CharityRegistry.sol";

/**
 * @title DonationManager
 * @dev Core contract for managing donations and automatic fund allocation
 */
contract DonationManager is ReentrancyGuard {
    struct Donation {
        uint256 id;
        address donor;
        uint256 totalAmount;
        uint256[] projectIds;
        uint256[] allocations;
        uint256 timestamp;
    }

    // State variables
    IERC20 public immutable mneeToken;
    CharityRegistry public immutable charityRegistry;

    uint256 private donationCounter;
    mapping(uint256 => Donation) private donations;
    mapping(address => uint256[]) private donorDonations;
    mapping(uint256 => uint256[]) private projectDonations;

    uint256 public totalDonated;
    mapping(address => uint256) public donorTotalDonated;

    // Events
    event DonationMade(
        uint256 indexed donationId,
        address indexed donor,
        uint256 totalAmount,
        uint256[] projectIds,
        uint256[] allocations,
        uint256 timestamp
    );

    event FundsAllocated(
        uint256 indexed projectId,
        uint256 amount,
        uint256 indexed donationId
    );

    /**
     * @dev Constructor
     * @param _mneeToken Address of the MNEE token contract
     * @param _charityRegistry Address of the CharityRegistry contract
     */
    constructor(address _mneeToken, address _charityRegistry) {
        require(_mneeToken != address(0), "Invalid MNEE token address");
        require(_charityRegistry != address(0), "Invalid registry address");

        mneeToken = IERC20(_mneeToken);
        charityRegistry = CharityRegistry(_charityRegistry);
    }

    /**
     * @dev Make a donation to multiple projects with specified allocation
     * @param projectIds Array of project IDs to donate to
     * @param percentages Array of percentages (must sum to 10000, representing 100.00%)
     * @param totalAmount Total amount to donate (in MNEE wei)
     * @return donationId The ID of the created donation
     */
    function donate(
        uint256[] calldata projectIds,
        uint256[] calldata percentages,
        uint256 totalAmount
    ) external nonReentrant returns (uint256) {
        require(projectIds.length > 0, "Must donate to at least one project");
        require(projectIds.length == percentages.length, "Arrays length mismatch");
        require(totalAmount > 0, "Amount must be greater than 0");

        // Validate percentages sum to 10000 (100.00%)
        uint256 percentageSum = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            percentageSum += percentages[i];
        }
        require(percentageSum == 10000, "Percentages must sum to 100%");

        // Validate all projects exist and are active
        for (uint256 i = 0; i < projectIds.length; i++) {
            require(
                charityRegistry.isProjectActive(projectIds[i]),
                "Project does not exist or is inactive"
            );
        }

        // Transfer MNEE from donor to this contract
        require(
            mneeToken.transferFrom(msg.sender, address(this), totalAmount),
            "Transfer failed"
        );

        // Calculate allocations and distribute
        uint256[] memory allocations = new uint256[](projectIds.length);
        uint256 allocatedSum = 0;

        for (uint256 i = 0; i < projectIds.length; i++) {
            // Calculate allocation (using basis points for precision)
            allocations[i] = (totalAmount * percentages[i]) / 10000;
            allocatedSum += allocations[i];

            // Get project wallet
            CharityRegistry.Project memory project = charityRegistry.getProject(projectIds[i]);

            // Transfer allocation to project wallet
            require(
                mneeToken.transfer(project.wallet, allocations[i]),
                "Allocation transfer failed"
            );

            // Record funds received in registry
            charityRegistry.recordFundsReceived(projectIds[i], allocations[i]);

            emit FundsAllocated(projectIds[i], allocations[i], donationCounter);
        }

        // Handle rounding remainder (if any) - give to first project
        uint256 remainder = totalAmount - allocatedSum;
        if (remainder > 0) {
            CharityRegistry.Project memory firstProject = charityRegistry.getProject(projectIds[0]);
            require(
                mneeToken.transfer(firstProject.wallet, remainder),
                "Remainder transfer failed"
            );
            allocations[0] += remainder;
            charityRegistry.recordFundsReceived(projectIds[0], remainder);
        }

        // Record donation
        donations[donationCounter] = Donation({
            id: donationCounter,
            donor: msg.sender,
            totalAmount: totalAmount,
            projectIds: projectIds,
            allocations: allocations,
            timestamp: block.timestamp
        });

        // Update mappings
        donorDonations[msg.sender].push(donationCounter);
        for (uint256 i = 0; i < projectIds.length; i++) {
            projectDonations[projectIds[i]].push(donationCounter);
        }

        // Update totals
        totalDonated += totalAmount;
        donorTotalDonated[msg.sender] += totalAmount;

        emit DonationMade(
            donationCounter,
            msg.sender,
            totalAmount,
            projectIds,
            allocations,
            block.timestamp
        );

        uint256 donationId = donationCounter;
        donationCounter++;

        return donationId;
    }

    /**
     * @dev Get donation details
     * @param donationId ID of the donation
     * @return Donation struct
     */
    function getDonation(uint256 donationId) external view returns (Donation memory) {
        require(donationId < donationCounter, "Donation does not exist");
        return donations[donationId];
    }

    /**
     * @dev Get all donations made by a donor
     * @param donor Address of the donor
     * @return Array of donation IDs
     */
    function getDonationsByDonor(address donor) external view returns (uint256[] memory) {
        return donorDonations[donor];
    }

    /**
     * @dev Get all donations to a project
     * @param projectId ID of the project
     * @return Array of donation IDs
     */
    function getDonationsByProject(uint256 projectId) external view returns (uint256[] memory) {
        return projectDonations[projectId];
    }

    /**
     * @dev Get total number of donations
     * @return Total donation count
     */
    function getTotalDonations() external view returns (uint256) {
        return donationCounter;
    }

    /**
     * @dev Get total amount donated by a specific donor
     * @param donor Address of the donor
     * @return Total amount donated
     */
    function getDonorTotal(address donor) external view returns (uint256) {
        return donorTotalDonated[donor];
    }

    /**
     * @dev Get donor statistics
     * @param donor Address of the donor
     * @return donationCount Number of donations made
     * @return totalDonatedAmount Total amount donated
     */
    function getDonorStats(address donor)
        external
        view
        returns (uint256 donationCount, uint256 totalDonatedAmount)
    {
        donationCount = donorDonations[donor].length;
        totalDonatedAmount = donorTotalDonated[donor];
    }
}
