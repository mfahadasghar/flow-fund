// Minimal ABIs for the contracts - only include functions we need

export const MNEE_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

export const CHARITY_REGISTRY_ABI = [
  // Project Functions
  "function getProject(uint256 projectId) view returns (tuple(uint256 id, string name, string description, address wallet, uint256 totalReceived, bool active, uint256 createdAt))",
  "function getAllActiveProjects() view returns (tuple(uint256 id, string name, string description, address wallet, uint256 totalReceived, bool active, uint256 createdAt)[])",
  "function getAllProjects() view returns (tuple(uint256 id, string name, string description, address wallet, uint256 totalReceived, bool active, uint256 createdAt)[])",
  "function getTotalProjects() view returns (uint256)",
  "function isProjectActive(uint256 projectId) view returns (bool)",

  // Application Functions
  "function submitApplication(string organizationName, string ein, string contactEmail, string missionStatement, address wallet, string documentsHash, string logoHash) returns (uint256)",
  "function approveApplication(uint256 applicationId, string projectDescription) returns (uint256)",
  "function rejectApplication(uint256 applicationId, string reason)",
  "function getApplication(uint256 applicationId) view returns (tuple(uint256 id, address applicant, string organizationName, string ein, string contactEmail, string missionStatement, address wallet, string documentsHash, string logoHash, uint8 status, uint256 submittedAt, uint256 reviewedAt, string reviewNotes))",
  "function getPendingApplications() view returns (tuple(uint256 id, address applicant, string organizationName, string ein, string contactEmail, string missionStatement, address wallet, string documentsHash, string logoHash, uint8 status, uint256 submittedAt, uint256 reviewedAt, string reviewNotes)[])",
  "function getAllApplications() view returns (tuple(uint256 id, address applicant, string organizationName, string ein, string contactEmail, string missionStatement, address wallet, string documentsHash, string logoHash, uint8 status, uint256 submittedAt, uint256 reviewedAt, string reviewNotes)[])",
  "function getApplicationsByApplicant(address applicant) view returns (uint256[])",
  "function getTotalApplications() view returns (uint256)",

  // Events
  "event ProjectCreated(uint256 indexed projectId, string name, address wallet, uint256 createdAt)",
  "event FundsReceived(uint256 indexed projectId, uint256 amount)",
  "event ApplicationSubmitted(uint256 indexed applicationId, address indexed applicant, string organizationName, uint256 submittedAt)",
  "event ApplicationApproved(uint256 indexed applicationId, uint256 indexed projectId, uint256 approvedAt)",
  "event ApplicationRejected(uint256 indexed applicationId, string reason, uint256 rejectedAt)",
] as const;

export const DONATION_MANAGER_ABI = [
  "function donate(uint256[] calldata projectIds, uint256[] calldata percentages, uint256 totalAmount) returns (uint256)",
  "function getDonation(uint256 donationId) view returns (tuple(uint256 id, address donor, uint256 totalAmount, uint256[] projectIds, uint256[] allocations, uint256 timestamp))",
  "function getDonationsByDonor(address donor) view returns (uint256[])",
  "function getDonationsByProject(uint256 projectId) view returns (uint256[])",
  "function getTotalDonations() view returns (uint256)",
  "function getDonorTotal(address donor) view returns (uint256)",
  "function getDonorStats(address donor) view returns (uint256 donationCount, uint256 totalDonatedAmount)",
  "function totalDonated() view returns (uint256)",
  "event DonationMade(uint256 indexed donationId, address indexed donor, uint256 totalAmount, uint256[] projectIds, uint256[] allocations, uint256 timestamp)",
  "event FundsAllocated(uint256 indexed projectId, uint256 amount, uint256 indexed donationId)",
] as const;
