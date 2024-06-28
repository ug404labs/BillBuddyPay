// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BillBuddyPay {
    IERC20 public usdcToken;

    struct Payment {
        uint256 id;
        string name;
        string description;
        address[] recipients;
        uint256[] shares;
        uint256 totalReceived;
        bool isSettled;
    }

    struct Expense {
        uint256 id;
        string name;
        string description;
        address[] payers;
        uint256[] shares;
        uint256 totalAmount;
        bool isPaid;
    }

    mapping(uint256 => Payment) public payments;
    mapping(uint256 => Expense) public expenses;
    uint256 public paymentCount;
    uint256 public expenseCount;

    mapping(address => uint256[]) public userPayments;
    mapping(address => uint256[]) public userExpenses;

    event PaymentCreated(uint256 indexed id, string name);
    event PaymentReceived(uint256 indexed id, uint256 amount);
    event ExpenseCreated(uint256 indexed id, string name);
    event ExpensePaid(uint256 indexed id);

    constructor(address _usdcTokenAddress) {
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function createPayment(string memory _name, string memory _description, address[] memory _recipients, uint256[] memory _shares) public {
        require(_recipients.length == _shares.length, "Recipients and shares must have the same length");
        
        paymentCount++;
        payments[paymentCount] = Payment(paymentCount, _name, _description, _recipients, _shares, 0, false);
        
        for (uint i = 0; i < _recipients.length; i++) {
            userPayments[_recipients[i]].push(paymentCount);
        }
        
        emit PaymentCreated(paymentCount, _name);
    }

    function receivePayment(uint256 _paymentId, uint256 _amount) public {
        Payment storage payment = payments[_paymentId];
        require(payment.id != 0, "Payment does not exist");

        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        payment.totalReceived += _amount;

        for (uint256 i = 0; i < payment.recipients.length; i++) {
            uint256 amount = (_amount * payment.shares[i]) / 100;
            require(usdcToken.transfer(payment.recipients[i], amount), "Transfer failed");
        }

        if (payment.totalReceived >= getTotalShares(payment.shares)) {
            payment.isSettled = true;
        }

        emit PaymentReceived(_paymentId, _amount);
    }

    function createExpense(string memory _name, string memory _description, address[] memory _payers, uint256[] memory _shares, uint256 _totalAmount) public {
        require(_payers.length == _shares.length, "Payers and shares must have the same length");
        
        expenseCount++;
        expenses[expenseCount] = Expense(expenseCount, _name, _description, _payers, _shares, _totalAmount, false);
        
        for (uint i = 0; i < _payers.length; i++) {
            userExpenses[_payers[i]].push(expenseCount);
        }
        
        emit ExpenseCreated(expenseCount, _name);
    }

    function payExpense(uint256 _expenseId) public {
        Expense storage expense = expenses[_expenseId];
        require(expense.id != 0, "Expense does not exist");
        require(!expense.isPaid, "Expense is already paid");

        uint256 payerShare = 0;
        for (uint256 i = 0; i < expense.payers.length; i++) {
            if (msg.sender == expense.payers[i]) {
                payerShare = (expense.totalAmount * expense.shares[i]) / 100;
                break;
            }
        }
        require(payerShare > 0, "Not a valid payer for this expense");

        require(usdcToken.transferFrom(msg.sender, address(this), payerShare), "Transfer failed");

        if (usdcToken.balanceOf(address(this)) >= expense.totalAmount) {
            expense.isPaid = true;
            emit ExpensePaid(_expenseId);
        }
    }

    function getUserPayments(address _user) public view returns (uint256[] memory) {
        return userPayments[_user];
    }

    function getUserExpenses(address _user) public view returns (uint256[] memory) {
        return userExpenses[_user];
    }

    function getPaymentDetails(uint256 _paymentId) public view returns (Payment memory) {
        return payments[_paymentId];
    }

    function getExpenseDetails(uint256 _expenseId) public view returns (Expense memory) {
        return expenses[_expenseId];
    }

    function getTotalShares(uint256[] memory _shares) private pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < _shares.length; i++) {
            total += _shares[i];
        }
        return total;
    }
}