const hre = require("hardhat");

async function main() {
  // 1. Get the Budget contract
  const Budget = await hre.ethers.getContractFactory("Budget");

  // 2. Deploy it
  const budget = await Budget.deploy();
  await budget.waitForDeployment();

  // 3. Print the address
  console.log("Budget Contract deployed to:", await budget.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});