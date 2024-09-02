# BillBuddy: Smart Contracts for Project and Sacco Management on Celo

BillBuddy is a blockchain-based solution for managing shared expenses in projects and local savings groups (Saccos), built on the Celo network. This repository contains two Solidity smart contracts designed to provide efficient and transparent ways to handle financial transactions within groups on Celo.

## Contracts

"""
REACT_APP_BILLBUDDY_sacco_ADDRESS=0x896657d5BC3A5B84197E91B5a4B797aeE9987710
REACT_APP_BILLBUDDY_PAY_CONTRACT=0x19Bb51d383186369B5122B72a196A57C63f2c2bD
REACT_APP_USDCBUDDY_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
"""

## BillBuddyProjectPay Contract

The BillBuddyProjectPay contract handles shared expenses and payments for projects on Celo.

### Main Features:

- Create shared payments with multiple recipients
- Receive and automatically distribute payments according to predefined shares
- Create shared expenses with multiple payers
- Pay expenses and handle refunds
- View payment and expense details

### Key Functions:

- `createPayment`: Create a new shared payment
- `receivePayment`: Receive and distribute a payment
- `createExpense`: Create a new shared expense
- `payExpense`: Pay an expense and handle refunds
- `getPaymentDetails`: View details of a specific payment
- `getExpenseDetails`: View details of a specific expense

## BillBuddySaccoManager Contract

The BillBuddySaccoManager contract manages local savings groups (Saccos) with regular contributions and distributions on Celo.

### Main Features:

- Add members to the savings group
- Receive member contributions
- Manage contribution rounds (e.g., weekly)
- Automatically distribute funds to members in a round-robin fashion
- Allow admin to manage rounds and group parameters
- View member and round details

### Key Functions:

- `addMember`: Add a new member to the group
- `contribute`: Allow members to make contributions
- `distributeRound`: Automatically distribute funds for a completed round
- `endRound`: Manually end a round (admin only)
- `getMemberDetails`: View details of a specific member
- `getRoundDetails`: View details of a specific round
- `updateContributionAmount`: Update the required contribution amount (admin only)
- `updateRoundDuration`: Update the duration of rounds (admin only)
- `withdrawExcessFunds`: Withdraw any excess funds in the contract (admin only)

## Using BillBuddy on Celo

To use BillBuddy:

1. Deploy the contracts to the Celo blockchain.
2. For BillBuddyProjectPay:
   - Create payments and expenses using the respective functions.
   - Members can contribute to expenses and receive payments through the contract.
3. For BillBuddySaccoManager:
   - Add members to the group using the `addMember` function.
   - Set the contribution amount and round duration.
   - Members can contribute using the `contribute` function.
   - Rounds will automatically distribute funds, or the admin can end rounds manually if needed.

## Celo-Specific Considerations

- Ensure you have a Celo wallet and sufficient CELO tokens for gas fees.
- Familiarize yourself with Celo's transaction mechanisms and gas pricing.
- Consider using Celo's native stablecoin (cUSD) for stable-value transactions within BillBuddy.

## Security Considerations

- Ensure that only authorized addresses can perform admin functions in BillBuddy.
- Regularly audit the BillBuddy contracts for potential vulnerabilities.
- Test thoroughly on Celo's testnet (Alfajores) before deploying to Celo mainnet.

## License

BillBuddy is released under the MIT License.

## Disclaimer

BillBuddy smart contracts are provided as-is. Users should perform their own security audit before using them in a production environment on the Celo network. The authors of BillBuddy are not responsible for any losses incurred through the use of these contracts.