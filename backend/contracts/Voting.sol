// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {

    //  Roles

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this.");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    //  Election Timing 

    uint public startTime;
    uint public endTime;

    event ElectionTimeSet(uint startTime, uint endTime);

    function setElectionTime(uint _startTime, uint _endTime) public onlyAdmin {
        require(_startTime < _endTime, "Start must be before end.");
        require(_startTime > block.timestamp, "Start time must be in the future.");
        startTime = _startTime;
        endTime = _endTime;
        emit ElectionTimeSet(_startTime, _endTime);
    }

    modifier electionOpen() {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Election is not open.");
        _;
    }

    modifier electionClosed() {
        require(block.timestamp > endTime, "Election has not ended yet.");
        _;
    }

    //  Candidates

    struct Candidate {
        uint id;
        string name;
        string photoCID;   // IPFS CID for the candidate's photo
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    event CandidateAdded(uint indexed id, string name, string photoCID);

    function addCandidate(string memory _name, string memory _photoCID) public onlyAdmin {
        require(
            block.timestamp < startTime || startTime == 0,
            "Cannot add candidates after election has started."
        );
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _photoCID, 0);
        emit CandidateAdded(candidatesCount, _name, _photoCID);
    }

    //  Voter Registration

    enum VoterStatus { NotRegistered, Pending, Verified, Rejected }

    mapping(address => VoterStatus) public voterStatus;
    mapping(address => string) public voterIdCID;  // IPFS CID of uploaded ID proof
    address[] public pendingVoters;                // So admin page can list requests

    event VoterRequested(address indexed voter, string idProofCID);
    event VoterApproved(address indexed voter);
    event VoterRejected(address indexed voter);

    function requestVoterRegistration(string memory _idProofCID) public {
        require(voterStatus[msg.sender] == VoterStatus.NotRegistered, "Already registered or pending.");
        voterStatus[msg.sender] = VoterStatus.Pending;
        voterIdCID[msg.sender] = _idProofCID;
        pendingVoters.push(msg.sender);
        emit VoterRequested(msg.sender, _idProofCID);
    }

    function approveVoter(address _voter) public onlyAdmin {
        require(voterStatus[_voter] == VoterStatus.Pending, "Voter is not pending.");
        voterStatus[_voter] = VoterStatus.Verified;
        emit VoterApproved(_voter);
    }

    function rejectVoter(address _voter) public onlyAdmin {
        require(voterStatus[_voter] == VoterStatus.Pending, "Voter is not pending.");
        voterStatus[_voter] = VoterStatus.Rejected;
        emit VoterRejected(_voter);
    }

    function getPendingVoters() public view returns (address[] memory) {
        return pendingVoters;
    }
 //Voting

    mapping(address => bool) public hasVoted;

    event VotedEvent(uint indexed candidateId, address indexed voter);

    function vote(uint _candidateId) public electionOpen {
        require(voterStatus[msg.sender] == VoterStatus.Verified, "You are not a verified voter.");
        require(!hasVoted[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VotedEvent(_candidateId, msg.sender);
    }

    //  Results 

    bool public resultsDeclared;
    uint public winnerId;

    event ResultsDeclared(uint indexed winnerId, string winnerName, uint voteCount);

    function declareResult() public onlyAdmin electionClosed {
        require(!resultsDeclared, "Results already declared.");
        require(candidatesCount > 0, "No candidates.");

        uint highestVotes = 0;
        uint winningId = 0;

        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                winningId = i;
            }
        }

        resultsDeclared = true;
        winnerId = winningId;

        emit ResultsDeclared(winningId, candidates[winningId].name, highestVotes);
    }

    function getWinner() public view returns (string memory name, string memory photoCID, uint voteCount) {
        require(resultsDeclared, "Results have not been declared yet.");
        Candidate memory w = candidates[winnerId];
        return (w.name, w.photoCID, w.voteCount);
    }
}