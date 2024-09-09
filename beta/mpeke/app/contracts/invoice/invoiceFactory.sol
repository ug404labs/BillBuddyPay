// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract InvoiceFactory {
    event InvoiceCreated(address invoiceAddress, address[] payees, uint256[] shares);

    address[] public allInvoices;
    mapping(address => bool) public isInvoice;

    function createInvoice(address[] memory payees, uint256[] memory shares) public returns (address) {
        Invoice newInvoice = (new Invoice){value: 0}(payees, shares);
        address invoiceAddress = address(newInvoice);
        allInvoices.push(invoiceAddress);
        isInvoice[invoiceAddress] = true;
        emit InvoiceCreated(invoiceAddress, payees, shares);
        return invoiceAddress;
    }

    function getAllInvoices() public view returns (address[] memory) {
        return allInvoices;
    }

    function getInvoiceDetails(address invoiceAddress) public view returns (address[] memory, uint256[] memory) {
    require(isInvoice[invoiceAddress], "Not a valid invoice");
    
    // Get the payees array from the Invoice contract using staticcall
    (bool success, bytes memory data) = invoiceAddress.staticcall(abi.encodeWithSignature("getPayees()"));
    require(success, "Failed to get payees");
    address[] memory payees = abi.decode(data, (address[]));
    
    uint256[] memory shares = new uint256[](payees.length);
    
    // For each payee, get their share from the Invoice contract using staticcall
    for (uint256 i = 0; i < payees.length; i++) {
        (success, data) = invoiceAddress.staticcall(abi.encodeWithSignature("getShares(address)", payees[i]));
        require(success, "Failed to get shares");
        shares[i] = abi.decode(data, (uint256));
    }
    
    return (payees, shares);
}


    function getInvoiceCount() public view returns (uint256) {
        return allInvoices.length;
    }
}

contract Invoice {
    using Address for address payable;

    event PaymentReceived(address from, uint256 amount);
    event PaymentReleased(address to, uint256 amount);
    event ERC20PaymentReleased(IERC20 indexed token, address to, uint256 amount);

    uint256 private immutable _totalShares;
    uint256 private _totalReleased;

    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _released;
    address[] private _payees;

    mapping(IERC20 => uint256) private _erc20TotalReleased;
    mapping(IERC20 => mapping(address => uint256)) private _erc20Released;

    constructor(address[] memory payees, uint256[] memory shares_) payable {
        require(payees.length == shares_.length, "Invoice: payees and shares length mismatch");
        require(payees.length > 0, "Invoice: no payees");

        uint256 totalShares_ = 0;
        for (uint256 i = 0; i < payees.length; i++) {
            _addPayee(payees[i], shares_[i]);
            totalShares_ += shares_[i];
        }

        _totalShares = totalShares_;
    }

    receive() external payable virtual {
        emit PaymentReceived(_msgSender(), msg.value);
    }

    function release(address payable account) public virtual {
        require(_shares[account] > 0, "Invoice: account has no shares");

        uint256 totalReceived = address(this).balance + _totalReleased;
        uint256 payment = (totalReceived * _shares[account]) / _totalShares - _released[account];

        require(payment != 0, "Invoice: account is not due payment");

        _released[account] += payment;
        _totalReleased += payment;

        account.sendValue(payment);
        emit PaymentReleased(account, payment);
    }

    function release(IERC20 token, address account) public virtual {
        require(_shares[account] > 0, "Invoice: account has no shares");

        uint256 totalReceived = token.balanceOf(address(this)) + _erc20TotalReleased[token];
        uint256 payment = (totalReceived * _shares[account]) / _totalShares - _erc20Released[token][account];

        require(payment != 0, "Invoice: account is not due payment");

        _erc20Released[token][account] += payment;
        _erc20TotalReleased[token] += payment;

        token.transfer(account, payment);
        emit ERC20PaymentReleased(token, account, payment);
    }

    function distribute() public virtual {
        for (uint256 i = 0; i < _payees.length; i++) {
            release(payable(_payees[i]));
        }
    }

    function distribute(IERC20 token) public virtual {
        for (uint256 i = 0; i < _payees.length; i++) {
            release(token, _payees[i]);
        }
    }

    function getTotalShares() public view returns (uint256) {
        return _totalShares;
    }

    function getTotalReleased() public view returns (uint256) {
        return _totalReleased;
    }

    function getShares(address account) public view returns (uint256) {
        return _shares[account];
    }

    function getReleased(address account) public view returns (uint256) {
        return _released[account];
    }

    function getPayees() public view returns (address[] memory) {
        return _payees;
    }

    function _addPayee(address account, uint256 shares_) private {
        require(account != address(0), "Invoice: account is the zero address");
        require(shares_ > 0, "Invoice: shares are 0");
        require(_shares[account] == 0, "Invoice: account already has shares");

        _payees.push(account);
        _shares[account] = shares_;
    }

    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}