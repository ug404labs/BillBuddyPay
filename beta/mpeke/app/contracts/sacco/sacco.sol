// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Sacco {
    enum SaccoType {
        ROTATING,
        FIXED_TERM
    }
    enum Period {
        WEEKLY,
        MONTHLY,
        FORTNIGHTLY,
        YEARLY
    }

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

    uint256 public groupId;
    SaccoGroup public saccoGroup;

    event ContributionMade(address member, uint256 amount);
    event FundsDistributed(address recipient, uint256 amount);

    constructor(
        uint256 _groupId,
        string memory _name,
        SaccoType _type,
        Period _period,
        uint256 _contributionAmount,
        uint256 _durationInPeriods,
        address[] memory _members
    ) {
        require(_members.length > 0, "Must have at least one member");

        groupId = _groupId;
        saccoGroup.name = _name;
        saccoGroup.saccoType = _type;
        saccoGroup.period = _period;
        saccoGroup.contributionAmount = _contributionAmount;
        saccoGroup.startDate = block.timestamp;
        saccoGroup.members = _members;

        uint256 periodDuration;
        if (_period == Period.WEEKLY) periodDuration = 1 weeks;
        else if (_period == Period.MONTHLY) periodDuration = 30 days;
        else if (_period == Period.FORTNIGHTLY) periodDuration = 2 weeks;
        else if (_period == Period.YEARLY) periodDuration = 365 days;

        saccoGroup.endDate = saccoGroup.startDate + (periodDuration * _durationInPeriods);
    }

    function contribute() external payable {
        require(block.timestamp < saccoGroup.endDate, "Sacco period has ended");
        require(isMember(msg.sender), "Not a member of this Sacco");
        require(msg.value == saccoGroup.contributionAmount, "Incorrect contribution amount");

        saccoGroup.contributions[msg.sender] += msg.value;
        saccoGroup.totalContributed += msg.value;

        emit ContributionMade(msg.sender, msg.value);

        if (saccoGroup.saccoType == SaccoType.ROTATING) {
            distributeRotatingFunds();
        }
    }

    function distributeRotatingFunds() internal {
        if (saccoGroup.totalContributed >= saccoGroup.contributionAmount * saccoGroup.members.length) {
            address recipient = saccoGroup.roundRecipients[saccoGroup.currentRound];
            if (recipient == address(0)) {
                recipient = saccoGroup.members[saccoGroup.currentRound % saccoGroup.members.length];
                saccoGroup.roundRecipients[saccoGroup.currentRound] = recipient;
            }

            uint256 amountToDistribute = saccoGroup.contributionAmount * saccoGroup.members.length;
            payable(recipient).transfer(amountToDistribute);
            saccoGroup.totalContributed -= amountToDistribute;
            saccoGroup.currentRound++;

            emit FundsDistributed(recipient, amountToDistribute);
        }
    }

    function withdrawFixedTerm() external {
        require(saccoGroup.saccoType == SaccoType.FIXED_TERM, "Not a fixed-term Sacco");
        require(block.timestamp >= saccoGroup.endDate, "Sacco period has not ended");
        require(isMember(msg.sender), "Not a member of this Sacco");

        uint256 amountToWithdraw = saccoGroup.contributions[msg.sender];
        require(amountToWithdraw > 0, "No funds to withdraw");

        saccoGroup.contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amountToWithdraw);

        emit FundsDistributed(msg.sender, amountToWithdraw);
    }

    function isMember(address _member) public view returns (bool) {
        for (uint256 i = 0; i < saccoGroup.members.length; i++) {
            if (saccoGroup.members[i] == _member) {
                return true;
            }
        }
        return false;
    }

    function getSaccoGroupInfo()
        external
        view
        returns (
            string memory name,
            SaccoType saccoType,
            Period period,
            uint256 contributionAmount,
            uint256 totalContributed,
            uint256 startDate,
            uint256 endDate,
            uint256 memberCount,
            uint256 currentRound
        )
    {
        return (
            saccoGroup.name,
            saccoGroup.saccoType,
            saccoGroup.period,
            saccoGroup.contributionAmount,
            saccoGroup.totalContributed,
            saccoGroup.startDate,
            saccoGroup.endDate,
            saccoGroup.members.length,
            saccoGroup.currentRound
        );
    }
}

contract SaccoFactory {
    uint256 public groupCounter;
    mapping(uint256 => address) public saccoGroups;

    event SaccoGroupCreated(uint256 groupId, string name, Sacco.SaccoType saccoType, address saccoAddress);

    function createSaccoGroup(
        string memory _name,
        Sacco.SaccoType _type,
        Sacco.Period _period,
        uint256 _contributionAmount,
        uint256 _durationInPeriods,
        address[] memory _members
    ) external {
        uint256 groupId = groupCounter++;
        Sacco newSacco = new Sacco(groupId, _name, _type, _period, _contributionAmount, _durationInPeriods, _members);
        saccoGroups[groupId] = address(newSacco);

        emit SaccoGroupCreated(groupId, _name, _type, address(newSacco));
    }

    function getSaccoAddress(uint256 _groupId) external view returns (address) {
        return saccoGroups[_groupId];
    }
}
