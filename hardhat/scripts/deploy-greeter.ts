import { ethers } from "hardhat";

async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");
  const g = await Greeter.deploy("Hello, Avalanche!");
  await g.waitForDeployment();
  
  const address = await g.getAddress();
  console.log("Greeter deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
