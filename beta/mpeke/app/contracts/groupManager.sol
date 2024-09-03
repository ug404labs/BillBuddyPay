// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GroupSavings {
    IERC20 public usdcToken; // USDC token interface

    enum SavingType { Fixed, Circular }

    struct SavingGroup {
        uint256 id;
        string name;
        SavingType savingType;
        address[] members;
        uint256 totalAmount; // Total amount to be saved
        uint256 contributionAmount; // Maximum contribution amount per member
        uint256 totalShares; // Total shares distributed among members
        uint256 rounds; // Total rounds for savings
        uint256 roundDuration; // Duration of each round in seconds
        uint256 currentRound; // Track the current round
        uint256 lastDistribution; // Timestamp of last distribution
        mapping(address => uint256) shares; // Shares per member
        mapping(address => uint256) contributions; // Contributions per member
        mapping(uint256 => bool) roundSettled; // Track if a round has been settled
    }

    struct GroupDetails {
        uint256 id;
        string name;
        SavingType savingType;
        address[] members;
        uint256 totalAmount;
        uint256 contributionAmount;
        uint256 totalShares;
        uint256 rounds;
        uint256 roundDuration;
        uint256 currentRound;
        uint256 lastDistribution;
    }

    mapping(uint256 => SavingGroup) public savingGroups;
    uint256 public groupCount;

    event GroupCreated(uint256 indexed groupId, string name, SavingType savingType, address[] members);
    event ContributionMade(uint256 indexed groupId, address contributor, uint256 amount);
    event GroupSettled(uint256 indexed groupId, uint256 round);
    event FundsDistributed(uint256 indexed groupId, uint256 round);

    constructor(address _usdcTokenAddress) {
        usdcToken = IERC20(_usdcTokenAddress); // Initialize USDC token address
    }

    function createSavingGroup(
        string memory _name,
        SavingType _savingType,
        address[] memory _members,
        uint256 _totalAmount,
        uint256 _contributionAmount,
        uint256 _rounds,
        uint256 _roundDuration
    ) public {
        require(_members.length > 0, "At least one member is required");
        require(_totalAmount > 0, "Total amount must be greater than 0");
        require(_contributionAmount > 0, "Contribution amount must be greater than 0");

        groupCount++;
        SavingGroup storage newGroup = savingGroups[groupCount];
        newGroup.id = groupCount;
        newGroup.name = _name;
        newGroup.savingType = _savingType;
        newGroup.members = _members;
        newGroup.totalAmount = _totalAmount;
        newGroup.contributionAmount = _contributionAmount;
        newGroup.rounds = _rounds;
        newGroup.roundDuration = _roundDuration;
        newGroup.currentRound = 1;
        newGroup.lastDistribution = block.timestamp;

        emit GroupCreated(groupCount, _name, _savingType, _members);
    }

    function contributeToGroup(uint256 _groupId, uint256 _amount) public {
        SavingGroup storage group = savingGroups[_groupId];
        require(block.timestamp < group.lastDistribution + group.roundDuration, "Current round has ended");
        require(group.contributions[msg.sender] + _amount <= group.contributionAmount, "Exceeds contribution limit");

        // Transfer USDC from the contributor to the contract
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        group.contributions[msg.sender] += _amount;

        if (group.shares[msg.sender] == 0) {
            group.members.push(msg.sender);
        }
        group.shares[msg.sender] += 1; // Default to one share, can be adjusted later

        emit ContributionMade(_groupId, msg.sender, _amount);
    }

    function settleRound(uint256 _groupId) public {
        SavingGroup storage group = savingGroups[_groupId];
        require(block.timestamp >= group.lastDistribution + group.roundDuration, "Round has not ended");
        require(!group.roundSettled[group.currentRound], "Round already settled");

        // Distribute funds based on shares
        uint256 totalShares = getTotalShares(group);
        for (uint256 i = 0; i < group.members.length; i++) {
            uint256 shareAmount = (group.totalAmount * group.shares[group.members[i]]) / totalShares;
            require(usdcToken.transfer(group.members[i], shareAmount), "Transfer to member failed");
        }

        group.roundSettled[group.currentRound] = true;
        group.currentRound++;
        group.lastDistribution = block.timestamp;

        emit GroupSettled(_groupId, group.currentRound - 1);
        emit FundsDistributed(_groupId, group.currentRound - 1);
    }

    function getTotalShares(SavingGroup storage group) private view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < group.members.length; i++) {
            total += group.shares[group.members[i]];
        }
        return total;
    }

    function getGroupDetails(uint256 _groupId) public view returns (GroupDetails memory) {
        SavingGroup storage group = savingGroups[_groupId];
        uint256 totalShares = getTotalShares(group);
        return GroupDetails({
            id: group.id,
            name: group.name,
            savingType: group.savingType,
            members: group.members,
            totalAmount: group.totalAmount,
            contributionAmount: group.contributionAmount,
            totalShares: totalShares,
            rounds: group.rounds,
            roundDuration: group.roundDuration,
            currentRound: group.currentRound,
            lastDistribution: group.lastDistribution
        });
    }
}