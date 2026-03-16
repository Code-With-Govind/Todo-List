document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addBtn = document.getElementById("add-btn");
  const taskList = document.getElementById("task-list");
  const taskCount = document.getElementById("task-count");
  const clearAllBtn = document.getElementById("clear-all-btn");

  // Load tasks from LocalStorage
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Initialize the app
  function init() {
    renderTasks();
  }

  // Render all tasks
  function renderTasks() {
    taskList.innerHTML = ""; // Clear current list

    if (tasks.length === 0) {
      taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
      updateStats();
      return;
    }

    tasks.forEach(task => {
      const li = createTaskElement(task);
      taskList.appendChild(li);
    });

    updateStats();
  }

  // Create HTML element for a task
  function createTaskElement(task) {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
        <span class="task-text">${escapeHTML(task.text)}</span>
      </div>
      <button class="delete-btn" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
    `;

    return li;
  }

  // Add a new task
  function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return; // Prevent empty tasks

    const newTask = {
      id: Date.now().toString(), // Unique ID based on timestamp
      text: text,
      completed: false
    };

    tasks.push(newTask);
    saveTasks();

    // Optimistic UI update instead of full re-render if it was empty
    if (tasks.length === 1) {
      renderTasks();
    } else {
      const li = createTaskElement(newTask);
      taskList.appendChild(li);
      updateStats();
    }

    taskInput.value = "";
    taskInput.focus();
  }

  // Save tasks to LocalStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Update statistics
  function updateStats() {
    const pendingTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${pendingTasks} task${pendingTasks !== 1 ? 's' : ''} left`;

    // Show/hide clear all button
    clearAllBtn.style.display = tasks.length > 0 ? "block" : "none";
  }

  // Toggle task completion
  function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    saveTasks();
    renderTasks();
  }

  // Delete a task
  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
  }

  // Utility function to prevent XSS
  function escapeHTML(str) {
    return str.replace(
      /[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Event Listeners
  addBtn.addEventListener("click", addTask);

  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  });

  clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
      tasks = [];
      saveTasks();
      renderTasks();
    }
  });

  // Event delegation for dynamically added elements
  taskList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li || li.classList.contains("empty-state")) return;

    const id = li.dataset.id;

    // Handle delete button click
    if (e.target.closest(".delete-btn")) {
      deleteTask(id);
      return;
    }

    // Handle checkbox or text click to toggle completion
    if (e.target.closest(".task-checkbox") || e.target.closest(".task-text")) {
      toggleTaskCompletion(id);
    }
  });

  // Run initial setup
  init();
});
