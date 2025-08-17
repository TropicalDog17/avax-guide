import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("MyToken");
  const [signer] = await ethers.getSigners();
  
  const t = await Token.deploy(
    "TuanTran Token",
    "TT",
    signer.address,
    ethers.parseEther("1000000")
  );
  await t.waitForDeployment();
  
  const address = await t.getAddress();
  console.log("Token deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
