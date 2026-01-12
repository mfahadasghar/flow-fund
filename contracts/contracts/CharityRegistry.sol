// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CharityRegistry
 * @dev Manages charity projects in the FlowFund platform
 */
contract CharityRegistry is Ownable {
    enum ApplicationStatus { Pending, Approved, Rejected }

    struct Project {
        uint256 id;
        string name;
        string description;
        address payable wallet;
        uint256 totalReceived;
        bool active;
        uint256 createdAt;
    }

    struct Application {
        uint256 id;
        address applicant;
        string organizationName;
        string ein;
        string contactEmail;
        string missionStatement;
        address payable wallet;
        string documentsHash; // IPFS hash for verification documents
        string logoHash; // IPFS hash for logo
        ApplicationStatus status;
        uint256 submittedAt;
        uint256 reviewedAt;
        string reviewNotes;
    }

    // State variables
    uint256 private projectCounter;
    mapping(uint256 => Project) private projects;
    uint256[] private projectIds;

    uint256 private applicationCounter;
    mapping(uint256 => Application) private applications;
    uint256[] private applicationIds;
    mapping(address => uint256[]) private applicantApplications;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        address wallet,
        uint256 createdAt
    );
    event ProjectDeactivated(uint256 indexed projectId);
    event ProjectUpdated(uint256 indexed projectId, string name, string description);
    event FundsReceived(uint256 indexed projectId, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new charity project
     * @param name Name of the charity project
     * @param description Description of the project
     * @param wallet Wallet address to receive donations
     * @return projectId The ID of the newly created project
     */
    function createProject(
        string memory name,
        string memory description,
        address payable wallet
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(wallet != address(0), "Invalid wallet address");

        uint256 projectId = projectCounter;
        projectCounter++;

        projects[projectId] = Project({
            id: projectId,
            name: name,
            description: description,
            wallet: wallet,
            totalReceived: 0,
            active: true,
            createdAt: block.timestamp
        });

        projectIds.push(projectId);

        emit ProjectCreated(projectId, name, wallet, block.timestamp);

        return projectId;
    }

    /**
     * @dev Update project information
     * @param projectId ID of the project to update
     * @param name New name
     * @param description New description
     */
    function updateProject(
        uint256 projectId,
        string memory name,
        string memory description
    ) external onlyOwner {
        require(projectId < projectCounter, "Project does not exist");
        require(bytes(name).length > 0, "Name cannot be empty");

        projects[projectId].name = name;
        projects[projectId].description = description;

        emit ProjectUpdated(projectId, name, description);
    }

    /**
     * @dev Deactivate a project (cannot be reactivated)
     * @param projectId ID of the project to deactivate
     */
    function deactivateProject(uint256 projectId) external onlyOwner {
        require(projectId < projectCounter, "Project does not exist");
        require(projects[projectId].active, "Project already inactive");

        projects[projectId].active = false;

        emit ProjectDeactivated(projectId);
    }

    /**
     * @dev Record funds received by a project (called by DonationManager)
     * @param projectId ID of the project
     * @param amount Amount received
     */
    function recordFundsReceived(uint256 projectId, uint256 amount) external {
        require(projectId < projectCounter, "Project does not exist");

        projects[projectId].totalReceived += amount;

        emit FundsReceived(projectId, amount);
    }

    /**
     * @dev Get project details
     * @param projectId ID of the project
     * @return Project struct containing all project information
     */
    function getProject(uint256 projectId) external view returns (Project memory) {
        require(projectId < projectCounter, "Project does not exist");
        return projects[projectId];
    }

    /**
     * @dev Get all active projects
     * @return Array of active Project structs
     */
    function getAllActiveProjects() external view returns (Project[] memory) {
        // First, count active projects
        uint256 activeCount = 0;
        for (uint256 i = 0; i < projectIds.length; i++) {
            if (projects[projectIds[i]].active) {
                activeCount++;
            }
        }

        // Create array of active projects
        Project[] memory activeProjects = new Project[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < projectIds.length; i++) {
            if (projects[projectIds[i]].active) {
                activeProjects[index] = projects[projectIds[i]];
                index++;
            }
        }

        return activeProjects;
    }

    /**
     * @dev Get all projects (active and inactive)
     * @return Array of all Project structs
     */
    function getAllProjects() external view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projectIds.length);
        for (uint256 i = 0; i < projectIds.length; i++) {
            allProjects[i] = projects[projectIds[i]];
        }
        return allProjects;
    }

    /**
     * @dev Get total number of projects
     * @return Total count of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return projectCounter;
    }

    /**
     * @dev Check if a project exists and is active
     * @param projectId ID of the project
     * @return true if project exists and is active
     */
    function isProjectActive(uint256 projectId) external view returns (bool) {
        return projectId < projectCounter && projects[projectId].active;
    }
}
