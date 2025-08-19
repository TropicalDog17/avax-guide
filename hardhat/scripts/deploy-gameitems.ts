import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy GameItems
  const GameItems = await ethers.getContractFactory("GameItems");
  const gameItems = await GameItems.deploy("https://game.example/api/item/");
  await gameItems.waitForDeployment();

  console.log("GameItems deployed to:", await gameItems.getAddress());

  // Mint some initial items (optional)
  const SWORD = await gameItems.SWORD();
  const SHIELD = await gameItems.SHIELD();
  const POTION = await gameItems.POTION();
  const LEGENDARY_ARMOR = await gameItems.LEGENDARY_ARMOR();

  await gameItems.mint(deployer.address, SWORD, 100, "0x");
  await gameItems.mint(deployer.address, SHIELD, 50, "0x");
  await gameItems.mint(deployer.address, POTION, 200, "0x");
  await gameItems.mint(deployer.address, LEGENDARY_ARMOR, 1, "0x");

  console.log("Initial items minted to:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
