
<a name="readme-top"></a>

<div align="center">
  <a href="https://github.com/celo-org/celo-composer">
    <img width="100px" src="https://github.com/celo-org/celo-composer/blob/main/images/readme/celo_isotype.svg" align="center" alt="Celo" />
  </a>

  <h3 align="center">BillBuddy</h3>

  <p align="center">
    A MiniPay dApp that allows splitting expenses between friends and managing sacco groups, making group payments and savings easy and transparent.
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>    
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

BillBuddy is a MiniPay decentralized application (dApp) designed to simplify group expenses and payments among friends. It also incorporates sacco functionalities, enabling users to create and manage savings groups with ease. BillBuddy ensures automatic and secure transactions, making it an ideal solution for managing shared expenses and group savings.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

-   [Celo Composer](https://github.com/celo-org/celo-composer)
-   [SocialConnect](https://github.com/celo-org/social-connect)
-   [Next.js](https://nextjs.org)
-   [Solidity](https://soliditylang.org/)
-   [Hardhat](https://hardhat.org/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

-   npm

    ```sh
    npm install npm@latest -g
    ```

-   node (>18)

    ```sh
    nvm use v18
    ```

### Installation

1. Clone the repo
    ```sh
    git clone https://github.com/celo-org/ethglobal-istanbul.git
    ```
2. Install NPM packages

    ```sh
    yarn install
    ```

3. Get WalletConnect projectId from [here](https://cloud.walletconnect.com/sign-in) and set it as an environment variable in `/code/packages/react-app/.env.local`

4. Set up your Issuer and DEK following the steps [here](https://github.com/celo-org/social-connect/blob/main/docs/key-setup.md) and set the respective environment variables in `/code/packages/react-app/.env.local`.

5. Set `NEXT_PUBLIC_ENVIRONMENT` in `/code/packages/react-app/.env.local` as `MAINNET` to use the app in MiniPay Site Tester.

6. Run the project using the following command:

    ```sh
    yarn dev
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

-   BillBuddy allows users to manage shared expenses and sacco groups seamlessly.
-   Users can create shared transactions, contribute to expenses, and manage group savings.
-   Detailed transaction history and real-time updates ensure transparency and ease of use.
-   [Here](/code/packages/react-app/pages/api/socialconnect/lookup.ts) is the code to lookup MiniPay registered users, it is expected you learn from this project and take the code you need for your own project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Your Name - [@illmindofbanana](https://twitter.com/illmindofbanana) - studyug@hotmail.com

Project Link: 

<p align="right">(<a href="#readme-top">back to top</a>)</p>
```