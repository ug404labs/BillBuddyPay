// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Sacco is Ownable {
    IERC20 public usdcToken;
    uint256 public saccoCreationFee;
    uint256 public groupCounter;

    enum SaccoType { ROTATING, FIXED_TERM }
    enum Period { WEEKLY, MONTHLY, FORTNIGHTLY, YEARLY }

    struct SaccoGroup {
        string name;
        SaccoType saccoType;
        Period period;
        uint256 contributionAmount;
        uint256 totalContributed;
        uint256 startDate;
        uint256 endDate;
        address[] members;
        mapping(address => uint256) contributions;
        uint256 currentRound;
        mapping(uint256 => address) roundRecipients;
    }

    mapping(uint256 => SaccoGroup) public saccoGroups;

    event SaccoGroupCreated(uint256 groupId, string name, SaccoType saccoType);
    event ContributionMade(uint256 groupId, address member, uint256 amount);
    event FundsDistributed(uint256 groupId, address recipient, uint256 amount);

    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
        saccoCreationFee = 1 ether; // Set an initial fee, can be changed by owner
    }

    function setSaccoCreationFee(uint256 _newFee) external onlyOwner {
        saccoCreationFee = _newFee;
    }

    function createSaccoGroup(
        string memory _name,
        SaccoType _type,
        Period _period,
        uint256 _contributionAmount,
        uint256 _durationInPeriods,
        address[] memory _members
    ) external payable {
        require(_members.length > 0, "Must have at least one member");
        require(msg.value >= saccoCreationFee, "Insufficient fee");

        uint256 groupId = groupCounter++;
        SaccoGroup storage newGroup = saccoGroups[groupId];
        newGroup.name = _name;
        newGroup.saccoType = _type;
        newGroup.period = _period;
        newGroup.contributionAmount = _contributionAmount;
        newGroup.startDate = block.timestamp;
        newGroup.members = _members;

        uint256 periodDuration;
        if (_period == Period.WEEKLY) periodDuration = 1 weeks;
        else if (_period == Period.MONTHLY) periodDuration = 30 days;
        else if (_period == Period.FORTNIGHTLY) periodDuration = 2 weeks;
        else if (_period == Period.YEARLY) periodDuration = 365 days;

        newGroup.endDate = newGroup.startDate + (periodDuration * _durationInPeriods);

        emit SaccoGroupCreated(groupId, _name, _type);

        if (msg.value > saccoCreationFee) {
            payable(msg.sender).transfer(msg.value - saccoCreationFee);
        }
    }

    function contribute(uint256 _groupId) external {
        SaccoGroup storage group = saccoGroups[_groupId];
        require(block.timestamp < group.endDate, "Sacco period has ended");
        require(isMember(_groupId, msg.sender), "Not a member of this Sacco");

        usdcToken.transferFrom(msg.sender, address(this), group.contributionAmount);
        group.contributions[msg.sender] += group.contributionAmount;
        group.totalContributed += group.contributionAmount;

        emit ContributionMade(_groupId, msg.sender, group.contributionAmount);

        if (group.saccoType == SaccoType.ROTATING) {
            distributeRotatingFunds(_groupId);
        }
    }

    function distributeRotatingFunds(uint256 _groupId) internal {
        SaccoGroup storage group = saccoGroups[_groupId];
        if (group.totalContributed >= group.contributionAmount * group.members.length) {
            address recipient = group.roundRecipients[group.currentRound];
            if (recipient == address(0)) {
                recipient = group.members[group.currentRound % group.members.length];
                group.roundRecipients[group.currentRound] = recipient;
            }

            uint256 amountToDistribute = group.contributionAmount * group.members.length;
            usdcToken.transfer(recipient, amountToDistribute);
            group.totalContributed -= amountToDistribute;
            group.currentRound++;

            emit FundsDistributed(_groupId, recipient, amountToDistribute);
        }
    }

    function withdrawFixedTerm(uint256 _groupId) external {
        SaccoGroup storage group = saccoGroups[_groupId];
        require(group.saccoType == SaccoType.FIXED_TERM, "Not a fixed-term Sacco");
        require(block.timestamp >= group.endDate, "Sacco period has not ended");
        require(isMember(_groupId, msg.sender), "Not a member of this Sacco");

        uint256 amountToWithdraw = group.contributions[msg.sender];
        require(amountToWithdraw > 0, "No funds to withdraw");

        group.contributions[msg.sender] = 0;
        usdcToken.transfer(msg.sender, amountToWithdraw);

        emit FundsDistributed(_groupId, msg.sender, amountToWithdraw);
    }

    function isMember(uint256 _groupId, address _member) public view returns (bool) {
        SaccoGroup storage group = saccoGroups[_groupId];
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == _member) {
                return true;
            }
        }
        return false;
    }

    function getSaccoGroupInfo(uint256 _groupId) external view returns (
        string memory name,
        SaccoType saccoType,
        Period period,
        uint256 contributionAmount,
        uint256 totalContributed,
        uint256 startDate,
        uint256 endDate,
        uint256 memberCount,
        uint256 currentRound
    ) {
        SaccoGroup storage group = saccoGroups[_groupId];
        return (
            group.name,
            group.saccoType,
            group.period,
            group.contributionAmount,
            group.totalContributed,
            group.startDate,
            group.endDate,
            group.members.length,
            group.currentRound
        );
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
