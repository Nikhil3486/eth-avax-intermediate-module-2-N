const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory for TaskManagementSystem
  const TaskManagementSystem = await ethers.getContractFactory("TaskManagementSystem");

  // Deploy the contract
  const taskManagementSystem = await TaskManagementSystem.deploy();  
  await taskManagementSystem.deployed();  // Wait for the deployment to be mined

  // Output the deployed contract address
  console.log(`TaskManagementSystem deployed to: ${taskManagementSystem.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
