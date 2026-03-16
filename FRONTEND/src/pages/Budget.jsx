import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { BUDGET_CONTRACT_ADDRESS } from "../contracts/contractConfig";
import { budgetABI } from "../contracts/budgetABI";
import "../styles/Budget.css";

export default function Budget() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [balance, setBalance] = useState("0");
  const [status, setStatus] = useState("");
  const [statusColor, setStatusColor] = useState("#4ade80");
  const [loading, setLoading] = useState(true);

  // Release funds form
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [releasing, setReleasing] = useState(false);

  // Deposit form
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  // Transaction history
  const [transactions, setTransactions] = useState([]);

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

      setProvider(prov);
      setSigner(sign);
      setWalletAddress(address.slice(0, 6) + "..." + address.slice(-4));

      await loadContractData(prov, address);
    } catch (err) {
      console.error(err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  async function loadContractData(prov, address) {
    try {
      const contract = new ethers.Contract(BUDGET_CONTRACT_ADDRESS, budgetABI, prov);

      // Get balance
      const bal = await contract.getBalance();
      setBalance(ethers.utils.formatEther(bal));

      // Check if current user is owner
      const ownerAddress = await contract.owner();
      console.log("Contract owner:", ownerAddress);
      console.log("Your address:", address);
      console.log("Match:", ownerAddress.toLowerCase() === address.toLowerCase());
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());


      // Load past events
      const receivedFilter = contract.filters.FundsReceived();
      const releasedFilter = contract.filters.FundsReleased();

      const receivedEvents = await contract.queryFilter(receivedFilter);
      const releasedEvents = await contract.queryFilter(releasedFilter);

      const txList = [
        ...receivedEvents.map(e => ({
          type: "received",
          from: e.args.from,
          amount: ethers.utils.formatEther(e.args.amount),
          hash: e.transactionHash
        })),
        ...releasedEvents.map(e => ({
          type: "released",
          to: e.args.to,
          amount: ethers.utils.formatEther(e.args.amount),
          hash: e.transactionHash
        }))
      ];

      setTransactions(txList.reverse());
    } catch (err) {
      console.error("Failed to load contract data:", err);
      setStatus("Failed to load budget data. Is the contract deployed?");
      setStatusColor("#f87171");
    }
  }

  async function depositFunds() {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      setStatus("Please enter a valid deposit amount.");
      setStatusColor("#f87171");
      return;
    }
    try {
      setDepositing(true);
      setStatus("Waiting for MetaMask confirmation...");
      setStatusColor("#f6c90e");

      const tx = await signer.sendTransaction({
        to: BUDGET_CONTRACT_ADDRESS,
        value: ethers.utils.parseEther(depositAmount)
      });

      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setStatus("✓ Funds deposited successfully!");
      setStatusColor("#4ade80");
      setDepositAmount("");
      await loadContractData(provider, await signer.getAddress());
    } catch (err) {
      console.error(err);
      setStatus("Deposit failed. Please try again.");
      setStatusColor("#f87171");
    } finally {
      setDepositing(false);
    }
  }

  async function releaseFunds() {
    if (!toAddress || !amount) {
      setStatus("Please fill in all fields.");
      setStatusColor("#f87171");
      return;
    }
    if (!ethers.utils.isAddress(toAddress)) {
      setStatus("Invalid recipient address.");
      setStatusColor("#f87171");
      return;
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      setStatus("Please enter a valid amount.");
      setStatusColor("#f87171");
      return;
    }
    try {
      setReleasing(true);
      setStatus("Waiting for MetaMask confirmation...");
      setStatusColor("#f6c90e");

      const contract = new ethers.Contract(BUDGET_CONTRACT_ADDRESS, budgetABI, signer);
      const tx = await contract.releaseFunds(toAddress, ethers.utils.parseEther(amount));

      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setStatus("✓ Funds released successfully!");
      setStatusColor("#4ade80");
      setToAddress("");
      setAmount("");
      await loadContractData(provider, await signer.getAddress());
    } catch (err) {
      console.error(err);
      if (err.message.includes("Not authorized")) {
        setStatus("Only the contract owner can release funds!");
        setStatusColor("#f87171");
      } else if (err.message.includes("Insufficient funds")) {
        setStatus("Insufficient funds in budget contract.");
        setStatusColor("#f87171");
      } else {
        setStatus("Release failed. Please try again.");
        setStatusColor("#f87171");
      }
    } finally {
      setReleasing(false);
    }
  }

  if (loading) {
    return (
      <div className="budget-loading">
        <div className="bg-grid" />
        <div className="loading-spinner" />
        <p>Loading budget data...</p>
      </div>
    );
  }

  return (
    <div className="budget-page">
      <div className="bg-grid" />

      <div className="budget-header">
        <button className="back-btn" onClick={() => navigate("/voting")}>
          ← Voting
        </button>
        <h2 className="header-title">💰 Budget Tracker</h2>
        <div className="wallet-pill">
          <span className="dot" />
          {walletAddress}
          {isOwner && <span className="owner-tag">Owner</span>}
        </div>
      </div>

      <div className="budget-content">

        {/* Balance Card */}
        <div className="balance-card">
          <p className="balance-label">CONTRACT BALANCE</p>
          <h1 className="balance-amount">{parseFloat(balance).toFixed(4)} <span>ETH</span></h1>
          <p className="balance-sub">Hardhat Localhost Network</p>
        </div>

        {status && (
          <div className="status-bar" style={{ color: statusColor, borderColor: statusColor + "33" }}>
            {status}
          </div>
        )}

        <div className="budget-grid">

          {/* Deposit Card */}
          <div className="budget-card">
            <h3>📥 Deposit Funds</h3>
            <p className="card-desc">Send ETH to the budget contract</p>
            <div className="input-group">
              <input
                type="number"
                placeholder="Amount in ETH (e.g. 0.5)"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                className="budget-input"
              />
              <span className="input-suffix">ETH</span>
            </div>
            <button
              className="budget-btn deposit-btn"
              onClick={depositFunds}
              disabled={depositing}
            >
              {depositing ? <><span className="spinner" /> Processing...</> : "Deposit"}
            </button>
          </div>

          {/* Release Card — only shown to owner */}
          <div className={`budget-card ${!isOwner ? "disabled-card" : ""}`}>
            <h3>📤 Release Funds</h3>
            <p className="card-desc">
              {isOwner ? "Send ETH to a recipient address" : "Only the contract owner can release funds"}
            </p>
            <div className="input-group">
              <input
                type="text"
                placeholder="Recipient address (0x...)"
                value={toAddress}
                onChange={e => setToAddress(e.target.value)}
                className="budget-input"
                disabled={!isOwner}
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                placeholder="Amount in ETH"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="budget-input"
                disabled={!isOwner}
              />
              <span className="input-suffix">ETH</span>
            </div>
            <button
              className="budget-btn release-btn"
              onClick={releaseFunds}
              disabled={releasing || !isOwner}
            >
              {releasing ? <><span className="spinner" /> Processing...</> : "Release Funds"}
            </button>
          </div>

        </div>

        {/* Transaction History */}
        <div className="tx-section">
          <h3>📋 Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="no-tx">No transactions yet.</p>
          ) : (
            <div className="tx-list">
              {transactions.map((tx, i) => (
                <div key={i} className={`tx-item ${tx.type}`}>
                  <div className="tx-icon">
                    {tx.type === "received" ? "↓" : "↑"}
                  </div>
                  <div className="tx-details">
                    <span className="tx-type">
                      {tx.type === "received" ? "Received" : "Released"}
                    </span>
                    <span className="tx-address">
                      {tx.type === "received"
                        ? `From: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`
                        : `To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}
                    </span>
                  </div>
                  <span className="tx-amount">
                    {tx.type === "received" ? "+" : "-"}{tx.amount} ETH
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}