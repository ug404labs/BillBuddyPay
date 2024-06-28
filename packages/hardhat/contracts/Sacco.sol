// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SaccoManager {
    struct Member {
        address payable wallet;
        uint256 totalContribution;
        uint256 lastContributionRound;
        bool isActive;
    }

    struct Round {
        uint256 startTime;
        uint256 endTime;
        uint256 totalContributions;
        address payable recipient;
        bool isDistributed;
    }

    address public admin;
    uint256 public memberCount;
    uint256 public roundDuration;
    uint256 public contributionAmount;
    uint256 public currentRound;

    mapping(address => Member) public members;
    mapping(uint256 => Round) public rounds;
    address[] public memberList;

    event MemberAdded(address indexed memberAddress);
    event ContributionReceived(
        address indexed member,
        uint256 amount,
        uint256 round
    );
    event RoundDistributed(
        uint256 indexed round,
        address recipient,
        uint256 amount
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyMember() {
        require(
            members[msg.sender].isActive,
            "Only active members can perform this action"
        );
        _;
    }

    constructor(uint256 _roundDuration, uint256 _contributionAmount) {
        admin = msg.sender;
        roundDuration = _roundDuration;
        contributionAmount = _contributionAmount;
        currentRound = 1;
        rounds[currentRound].startTime = block.timestamp;
        rounds[currentRound].endTime = block.timestamp + roundDuration;
    }

    function addMember(address payable _memberAddress) public onlyAdmin {
        require(!members[_memberAddress].isActive, "Member already exists");

        members[_memberAddress] = Member(_memberAddress, 0, 0, true);
        memberList.push(_memberAddress);
        memberCount++;

        emit MemberAdded(_memberAddress);
    }

    function contribute() public payable onlyMember {
        require(
            msg.value == contributionAmount,
            "Incorrect contribution amount"
        );
        require(
            block.timestamp <= rounds[currentRound].endTime,
            "Current round has ended"
        );

        members[msg.sender].totalContribution += msg.value;
        members[msg.sender].lastContributionRound = currentRound;
        rounds[currentRound].totalContributions += msg.value;

        emit ContributionReceived(msg.sender, msg.value, currentRound);

        if (
            rounds[currentRound].totalContributions ==
            contributionAmount * memberCount
        ) {
            distributeRound();
        }
    }

    function distributeRound() internal {
        require(
            !rounds[currentRound].isDistributed,
            "Round already distributed"
        );

        address payable recipient = payable(memberList[currentRound - 1]);
        uint256 amount = rounds[currentRound].totalContributions;

        rounds[currentRound].recipient = recipient;
        rounds[currentRound].isDistributed = true;

        recipient.transfer(amount);

        emit RoundDistributed(currentRound, recipient, amount);

        currentRound++;
        rounds[currentRound].startTime = block.timestamp;
        rounds[currentRound].endTime = block.timestamp + roundDuration;
    }

    function endRound() public onlyAdmin {
        require(
            block.timestamp > rounds[currentRound].endTime,
            "Round has not ended yet"
        );

        if (!rounds[currentRound].isDistributed) {
            distributeRound();
        }
    }

    function getMemberDetails(
        address _memberAddress
    ) public view returns (Member memory) {
        return members[_memberAddress];
    }

    function getRoundDetails(
        uint256 _roundNumber
    ) public view returns (Round memory) {
        return rounds[_roundNumber];
    }

    function updateContributionAmount(uint256 _newAmount) public onlyAdmin {
        contributionAmount = _newAmount;
    }

    function updateRoundDuration(uint256 _newDuration) public onlyAdmin {
        roundDuration = _newDuration;
    }

    function withdrawExcessFunds() public onlyAdmin {
        uint256 contractBalance = address(this).balance;
        uint256 expectedBalance = rounds[currentRound].totalContributions;

        require(contractBalance > expectedBalance, "No excess funds available");

        uint256 excessAmount = contractBalance - expectedBalance;
        payable(admin).transfer(excessAmount);
    }
}
