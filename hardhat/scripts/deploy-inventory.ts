import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Character NFT
  const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
  const characterNFT = await CharacterNFT.deploy();
  await characterNFT.waitForDeployment();
  const characterAddress = await characterNFT.getAddress();
  console.log("CharacterNFT deployed to:", characterAddress);

  // Deploy Inventory NFT with Character NFT address
  const InventoryNFT = await ethers.getContractFactory("InventoryNFT");
  const inventoryNFT = await InventoryNFT.deploy(characterAddress);
  await inventoryNFT.waitForDeployment();
  const inventoryAddress = await inventoryNFT.getAddress();
  console.log("InventoryNFT deployed to:", inventoryAddress);

  // Mint a character to EWOQ
  const EWOQ_ADDRESS = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
  await characterNFT.mint(EWOQ_ADDRESS);
  console.log("Minted character #0 to EWOQ");

  // Mint some items to EWOQ
  await inventoryNFT.mint(EWOQ_ADDRESS, 0, 1); // Sword
  await inventoryNFT.mint(EWOQ_ADDRESS, 1, 1); // Shield
  await inventoryNFT.mint(EWOQ_ADDRESS, 2, 2); // Potions
  await inventoryNFT.mint(EWOQ_ADDRESS, 3, 1); // Legendary Armor
  console.log("Minted items to EWOQ");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
