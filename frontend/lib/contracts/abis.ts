// Standard ERC-20 ABI for MNEE token
export const MNEE_ABI = [
  // Read functions
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",

  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",

  // Events - used to track donations
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
] as const;

// These are no longer used - keeping for reference
export const CHARITY_REGISTRY_ABI = [] as const;
export const DONATION_MANAGER_ABI = [] as const;
