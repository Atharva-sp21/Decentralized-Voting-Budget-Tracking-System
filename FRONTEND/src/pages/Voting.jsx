import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS } from "../contracts/contractConfig";
import { votingABI } from "../contracts/votingABI";
import "../styles/Voting.css";

export default function Voting() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [status, setStatus] = useState("");
  const [statusColor, setStatusColor] = useState("#4ade80");
  const [candidates, setCandidates] = useState([]);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initWallet();
  }, []);

  async function initWallet() {
    if (!window.ethereum) {
      navigate("/");
      return;
    }
    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await prov.listAccounts();

      if (accounts.length === 0) {
        navigate("/");
        return;
      }

      const sign = prov.getSigner();
      const address = await sign.getAddress();
      const network = await prov.getNetwork();

      setProvider(prov);
      setSigner(sign);
      setWalletAddress(address.slice(0, 6) + "..." + address.slice(-4));
      setNetworkName(network.name === "unknown" ? "Hardhat Localhost" : network.name);

      await loadCandidates(prov);
    } catch (err) {
      console.error(err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  async function loadCandidates(prov) {
    try {
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, votingABI, prov);
      const count = await contract.candidatesCount();
      const list = [];
      const total = await getTotalVotes(contract, count);

      for (let i = 0; i < count; i++) {
        const c = await contract.candidates(i);
        list.push({
          id: c.id.toString(),
          name: c.name,
          voteCount: c.voteCount.toString(),
          percentage: total > 0 ? Math.round((Number(c.voteCount) / total) * 100) : 0
        });
      }
      setCandidates(list);
    } catch (err) {
      console.error("Failed to load candidates:", err);
      setStatus("Failed to load candidates. Is Hardhat node running?");
      setStatusColor("#f87171");
    }
  }

  async function getTotalVotes(contract, count) {
    let total = 0;
    for (let i = 0; i < count; i++) {
      const c = await contract.candidates(i);
      total += Number(c.voteCount);
    }
    return total;
  }

  async function castVote(candidateId) {
    if (!signer) return;
    try {
      setVoting(true);
      setStatus("Waiting for MetaMask confirmation...");
      setStatusColor("#f6c90e");

      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, votingABI, signer);
      const tx = await contract.vote(candidateId);

      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setStatus("Vote cast successfully!");
      setStatusColor("#4ade80");
      await loadCandidates(provider);
    } catch (err) {
      console.error(err);
      if (err.message.includes("already voted")) {
        setStatus("You have already voted!");
      } else {
        setStatus("Voting failed. Please try again.");
      }
      setStatusColor("#f87171");
    } finally {
      setVoting(false);
    }
  }

  if (loading) {
    return (
      <div className="voting-loading">
        <div className="bg-grid" />
        <div className="loading-spinner" />
        <p>Loading voting data...</p>
      </div>
    );
  }

  return (
    <div className="voting-page">
      <div className="bg-grid" />

      <div className="voting-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          Back
        </button>
        <div className="wallet-pill">
          <span className="dot" />
          {walletAddress}
          <span className="network-tag">{networkName}</span>
        </div>
      </div>

      <div className="voting-card">
        <div className="voting-title-section">
          <span className="ballot-icon">Vote</span>
          <h1>Cast Your Vote</h1>
          <p className="voting-subtitle">Select a candidate below. Your vote is recorded on the blockchain.</p>
        </div>

        {status && (
          <div className="status-bar" style={{ color: statusColor, borderColor: statusColor + "33" }}>
            {status}
          </div>
        )}

        <div className="candidates-grid">
          {candidates.length === 0 ? (
            <p className="no-candidates">No candidates found. Check your contract.</p>
          ) : (
            candidates.map((c) => (
              <div key={c.id} className="candidate-card">
                <div className="candidate-top">
                  <div className="candidate-avatar">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="candidate-details">
                    <h3>{c.name}</h3>
                    <span className="vote-count">{c.voteCount} votes · {c.percentage}%</span>
                  </div>
                </div>
                <div className="vote-bar-wrap">
                  <div className="vote-bar" style={{ width: `${c.percentage}%` }} />
                </div>
                <button
                  className="vote-btn"
                  onClick={() => castVote(c.id)}
                  disabled={voting}
                >
                  {voting ? "Processing..." : "Vote"}
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            onClick={() => navigate("/budget")}
            className="budget-nav-btn"
          >
            Go to Budget Tracker
          </button>
        </div>

      </div>
    </div>
  );
}