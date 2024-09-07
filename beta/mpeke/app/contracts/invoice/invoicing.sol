// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InvoiceSystem {
    IERC20 public stablecoin;

    struct Recipient {
        address wallet;
        uint256 percentage;
    }

    struct Invoice {
        uint256 id;
        string name;
        string description;
        uint256 totalAmount;
        Recipient[] recipients;
        bool isPaid;
        address creator;
    }

    mapping(uint256 => Invoice) public invoices;
    uint256 public invoiceCount;

    event InvoiceCreated(uint256 indexed id, string name, uint256 totalAmount);
    event InvoicePaid(uint256 indexed id);

    constructor(address _stablecoinAddress) {
        stablecoin = IERC20(_stablecoinAddress);
    }

    function createInvoice(
        string memory _name,
        string memory _description,
        uint256 _totalAmount,
        address[] memory _recipients,
        uint256[] memory _percentages
    ) public {
        require(_recipients.length == _percentages.length, "Recipients and percentages must match");
        require(_recipients.length > 0, "At least one recipient required");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _percentages.length; i++) {
            totalPercentage += _percentages[i];
        }
        require(totalPercentage == 100, "Percentages must sum to 100");

        invoiceCount++;
        Invoice storage newInvoice = invoices[invoiceCount];
        newInvoice.id = invoiceCount;
        newInvoice.name = _name;
        newInvoice.description = _description;
        newInvoice.totalAmount = _totalAmount;
        newInvoice.creator = msg.sender;

        for (uint256 i = 0; i < _recipients.length; i++) {
            newInvoice.recipients.push(Recipient({wallet: _recipients[i], percentage: _percentages[i]}));
        }

        emit InvoiceCreated(invoiceCount, _name, _totalAmount);
    }

    function payInvoice(uint256 _invoiceId) public {
        Invoice storage invoice = invoices[_invoiceId];
        require(!invoice.isPaid, "Invoice already paid");

        require(stablecoin.transferFrom(msg.sender, address(this), invoice.totalAmount), "Transfer failed");

        for (uint256 i = 0; i < invoice.recipients.length; i++) {
            uint256 amount = (invoice.totalAmount * invoice.recipients[i].percentage) / 100;
            require(stablecoin.transfer(invoice.recipients[i].wallet, amount), "Transfer to recipient failed");
        }

        invoice.isPaid = true;
        emit InvoicePaid(_invoiceId);
    }

    function getInvoice(uint256 _invoiceId)
        public
        view
        returns (
            uint256 id,
            string memory name,
            string memory description,
            uint256 totalAmount,
            bool isPaid,
            address creator
        )
    {
        Invoice storage invoice = invoices[_invoiceId];
        return (invoice.id, invoice.name, invoice.description, invoice.totalAmount, invoice.isPaid, invoice.creator);
    }

    function getInvoiceRecipients(uint256 _invoiceId)
        public
        view
        returns (address[] memory addresses, uint256[] memory percentages)
    {
        Invoice storage invoice = invoices[_invoiceId];
        addresses = new address[](invoice.recipients.length);
        percentages = new uint256[](invoice.recipients.length);

        for (uint256 i = 0; i < invoice.recipients.length; i++) {
            addresses[i] = invoice.recipients[i].wallet;
            percentages[i] = invoice.recipients[i].percentage;
        }

        return (addresses, percentages);
    }
}
