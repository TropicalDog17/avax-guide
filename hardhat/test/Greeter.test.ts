import { expect } from "chai";
import { ethers } from "hardhat";
import { Greeter } from "../typechain-types";

describe("Greeter", function () {
  let greeter: Greeter;

  beforeEach(async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    greeter = await Greeter.deploy("Hello, tests!");
    await greeter.waitForDeployment();
  });

  it("Should return the initial greeting", async function () {
    expect(await greeter.greet()).to.equal("Hello, tests!");
  });

  it("Should change the greeting", async function () {
    const newGreeting = "Hello, changed!";
    await greeter.setGreeting(newGreeting);
    expect(await greeter.greet()).to.equal(newGreeting);
  });
});
