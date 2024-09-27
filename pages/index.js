import { useState, useEffect } from "react";
import { ethers } from "ethers";
import TaskManagementSystemAbi from "../artifacts/contracts/TaskManagementSystem.sol/TaskManagementSystem.json"; // Update with your actual ABI file

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [taskManagementSystem, setTaskManagementSystem] = useState(undefined);
  const [taskDetails, setTaskDetails] = useState({});
  const [message, setMessage] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [taskId, setTaskId] = useState("");

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Update with your contract address
  const taskManagementSystemABI = TaskManagementSystemAbi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(undefined);
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getTaskManagementSystemContract();
    } catch (error) {
      setMessage("Error connecting account: " + (error.message || error));
    }
  };

  const getTaskManagementSystemContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const taskManagementSystemContract = new ethers.Contract(contractAddress, taskManagementSystemABI, signer);
    setTaskManagementSystem(taskManagementSystemContract);
  };

  const addTask = async () => {
    setMessage("");
    if (taskManagementSystem) {
      try {
        const unixDeadline = new Date(deadline).getTime() / 1000;
        let tx = await taskManagementSystem.createTask(taskDescription, assignee, parseInt(priority), unixDeadline);
        await tx.wait();
        setMessage("Task added successfully!");
      } catch (error) {
        setMessage("Error adding task: " + (error.message || error));
      }
    }
  };

  const completeTask = async () => {
    setMessage("");
    if (taskManagementSystem) {
      try {
        let tx = await taskManagementSystem.completeTask(parseInt(taskId));
        await tx.wait();
        setMessage("Task marked as completed successfully!");
        checkTaskDetails(parseInt(taskId));
      } catch (error) {
        setMessage("Error marking task as completed: " + (error.message || error));
      }
    }
  };

  const checkTaskDetails = async (taskId) => {
    try {
      if (taskManagementSystem) {
        const task = await taskManagementSystem.tasks(taskId);
        setTaskDetails({
          description: task.description,
          creator: task.creator,
          assignee: task.assignee,
          isCompleted: task.isCompleted,
          priority: task.priority.toString(), // Convert BigNumber to string
          deadline: new Date(parseInt(task.deadline.toString()) * 1000).toLocaleString(), // Convert Unix timestamp to human-readable date
        });
      }
    } catch (error) {
      setMessage("Error fetching task details: " + (error.message || error));
    }
  };
  
  const handleTaskIdChange = (e) => {
    const newTaskId = e.target.value;
    setTaskId(newTaskId);
    if (newTaskId) {
      checkTaskDetails(parseInt(newTaskId));
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this task management system.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect MetaMask Wallet</button>;
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <div className="task-actions">
          <input
            type="text"
            placeholder="Task Description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Assignee Address"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value={1}>Low Priority</option>
            <option value={2}>Medium Priority</option>
            <option value={3}>High Priority</option>
          </select>
          <input
            type="datetime-local"
            placeholder="Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <button onClick={addTask}>Add Task</button>

          <input
            type="number"
            placeholder="Task ID"
            value={taskId}
            onChange={handleTaskIdChange}
          />
          <button onClick={completeTask}>Mark Task as Completed</button>

          <div className="task-info">
            {taskId && (
              <div>
                <p>Task Description: {taskDetails.description}</p>
                <p>Assignee: {taskDetails.assignee}</p>
                <p>Priority: {taskDetails.priority}</p>
                <p>Deadline: {taskDetails.deadline}</p>
                <p>Completed: {taskDetails.isCompleted ? "Yes" : "No"}</p>
              </div>
            )}
          </div>
        </div>
        {message && <p><strong>{message}</strong></p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to Task Management System</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: white;
          color: black;
          font-family: "Times New Roman", serif;
          border: 10px solid black;
          border-radius: 20px;
          background-image: url("https://i.pinimg.com/originals/41/9b/76/419b764b109196b16cfb7320882c27c7.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          height: 850px;
          width: 1500px;
          opacity: 0.9;
          font-weight: 1000;
          padding: 20px;
        }

        header {
          padding: 10px;
        }

        h1 {
          font-family: "Arial", serif;
          font-size: 60px;
          margin-bottom: 20px;
        }

        .task-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 15px 25px;
          font-size: 22px;
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        button:hover {
          background-color: #388e3c;
        }
      `}</style>
    </main>
  );
}
