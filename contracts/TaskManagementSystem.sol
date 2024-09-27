// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract TaskManagementSystem {
    struct Task {
        uint taskId;
        string description;  // Description of the task
        address creator;     // Task creator
        address assignee;    // Task assigned to
        bool isCompleted;    // Status of the task
        uint priority;       // Priority level (1 - Low, 2 - Medium, 3 - High)
        uint deadline;       // Unix timestamp for task deadline
    }

    uint public taskCount;
    mapping(uint => Task) public tasks;  // Mapping taskId to Task
    mapping(address => uint[]) public assignedTasks;  // Tasks assigned to an individual

    event TaskCreated(uint taskId, string description, address assignee, uint priority, uint deadline);
    event TaskCompleted(uint taskId, address assignee);
    event TaskReassigned(uint taskId, address oldAssignee, address newAssignee);

    // Function to create and assign a task
    function createTask(string memory description, address assignee, uint priority, uint deadline) public {
        require(bytes(description).length > 0, "Task description cannot be empty");
        require(assignee != address(0), "Invalid assignee address");
        require(priority > 0 && priority <= 3, "Priority should be between 1 and 3");
        require(deadline > block.timestamp, "Deadline should be in the future");

        taskCount++;
        tasks[taskCount] = Task(taskCount, description, msg.sender, assignee, false, priority, deadline);
        assignedTasks[assignee].push(taskCount);

        emit TaskCreated(taskCount, description, assignee, priority, deadline);
    }

    // Function for the assignee to mark the task as completed
    function completeTask(uint taskId) public {
        Task storage task = tasks[taskId];

        // Ensure the caller is the assignee and the task is not completed
        require(msg.sender == task.assignee, "You are not the assignee of this task");
        require(!task.isCompleted, "Task is already completed");

        task.isCompleted = true;

        emit TaskCompleted(taskId, msg.sender);
    }

    // Function to reassign a task to someone else
    function reassignTask(uint taskId, address newAssignee) public {
        Task storage task = tasks[taskId];

        // Ensure only the task creator can reassign the task
        require(msg.sender == task.creator, "Only the creator can reassign the task");
        require(newAssignee != address(0), "Invalid new assignee");

        // Update the task assignee and reassign
        address oldAssignee = task.assignee;
        task.assignee = newAssignee;
        assignedTasks[newAssignee].push(taskId);

        emit TaskReassigned(taskId, oldAssignee, newAssignee);
    }

    // Function to check the status of a task
    function checkTaskStatus(uint taskId) public view returns (bool) {
        Task storage task = tasks[taskId];
        return task.isCompleted;
    }

    // Function to retrieve tasks assigned to a specific user
    function getTasksByAssignee(address assignee) public view returns (uint[] memory) {
        return assignedTasks[assignee];
    }

    // Function to retrieve tasks based on priority
    function getTasksByPriority(uint priorityLevel) public view returns (uint[] memory) {
        uint[] memory tempTaskList = new uint[](taskCount);
        uint counter = 0;

        for (uint i = 1; i <= taskCount; i++) {
            if (tasks[i].priority == priorityLevel) {
                tempTaskList[counter] = i;
                counter++;
            }
        }

        // Create a new array with exact size
        uint[] memory priorityTaskList = new uint[](counter);
        for (uint i = 0; i < counter; i++) {
            priorityTaskList[i] = tempTaskList[i];
        }

        return priorityTaskList;
    }

    // Function to check if a task has missed its deadline
    function checkMissedDeadlines() public view returns (uint[] memory) {
        uint[] memory tempTaskList = new uint[](taskCount);
        uint counter = 0;

        for (uint i = 1; i <= taskCount; i++) {
            if (tasks[i].deadline < block.timestamp && !tasks[i].isCompleted) {
                tempTaskList[counter] = i;
                counter++;
            }
        }

        // Create a new array with exact size
        uint[] memory missedDeadlineTaskList = new uint[](counter);
        for (uint i = 0; i < counter; i++) {
            missedDeadlineTaskList[i] = tempTaskList[i];
        }

        return missedDeadlineTaskList;
    }
}
