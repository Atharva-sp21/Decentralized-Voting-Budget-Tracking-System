export const budgetABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "FundsReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "phaseIndex", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "evidenceCID", "type": "string" }
    ],
    "name": "PhaseProofSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "phaseIndex", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "contractor", "type": "address" }
    ],
    "name": "PhaseReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "contractor", "type": "address" }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "address payable", "name": "_contractor", "type": "address" },
      { "internalType": "uint256", "name": "_startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "_endTime", "type": "uint256" },
      { "internalType": "string[]", "name": "_phaseNames", "type": "string[]" },
      { "internalType": "uint256[]", "name": "_phaseBudgets", "type": "uint256[]" }
    ],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }],
    "name": "getPhases",
    "outputs": [
      { "internalType": "string[]", "name": "names", "type": "string[]" },
      { "internalType": "uint256[]", "name": "budgets", "type": "uint256[]" },
      { "internalType": "string[]", "name": "evidenceCIDs", "type": "string[]" },
      { "internalType": "uint8[]", "name": "statuses", "type": "uint8[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "projectCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "projects",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "address payable", "name": "contractor", "type": "address" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "uint256", "name": "currentPhase", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_projectId", "type": "uint256" }],
    "name": "releasePhase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_projectId", "type": "uint256" },
      { "internalType": "string", "name": "_evidenceCID", "type": "string" }
    ],
    "name": "submitPhaseProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];