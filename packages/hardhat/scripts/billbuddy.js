const hre = require("hardhat");

const STABLE_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const STABLE_TOKEN_ADDRESS_TESTNET = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

async function addExpense(address) {
    let billBuddy = await ethers.getContractAt("BillBuddy", address);

    await billBuddy.createExpense(
        "Dinner at Gateway",
        ethers.utils.parseEther("1"),
        [
            "0x4f4c70c011b065dc45a7a13cb72e645c6a50dde3",
            "0x54a8c3cafc55e19a1c7af46c571d0fbef3e830f5"
        ],
        [
            "0x22e4aFF96b5200F2789033d85fCa9F58f163E9Ea",
            "0xe92401A4d3af5E446d93D11EEc806b1462b39D15"
        ],
        [50, 50] // Shares in percentage
    );
    console.log("Expense added!");
}

async function deploy() {
    const BillBuddy = await hre.ethers.getContractFactory("BillBuddy");
    const billBuddy = await BillBuddy.deploy(STABLE_TOKEN_ADDRESS);
    await billBuddy.deployed();

    console.log("BillBuddy deployed to:", billBuddy.address);
}

async function main() {
    await deploy();
    // Uncomment the line below and replace with your contract address to test addExpense function
    // await addExpense("YOUR_CONTRACT_ADDRESS");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
