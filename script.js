let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function allowDrop(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text");
  const taskEl = document.querySelector(`[data-id='${taskId}']`);
  e.currentTarget.appendChild(taskEl);

  const columnId = e.currentTarget.id;
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = columnId;
    saveTasks();
    sortTasksInColumn(columnId); // 🔄 Sort after drop
  }
}

function drag(e) {
  e.dataTransfer.setData("text", e.target.dataset.id);
}

function createTaskElement(task) {
  const taskEl = document.createElement("div");
  taskEl.className = "task";
  taskEl.draggable = true;
  taskEl.dataset.id = task.id;
  taskEl.dataset.priority = task.priority; // 🆕 for sorting
  taskEl.addEventListener("dragstart", drag);

  const contentSpan = document.createElement("span");
  contentSpan.textContent = task.text;
  contentSpan.className = "task-content";

  contentSpan.ondblclick = () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = contentSpan.textContent;
    input.className = "edit-input";
    taskEl.replaceChild(input, contentSpan);
    input.focus();

    input.onblur = () => {
      task.text = input.value;
      contentSpan.textContent = input.value;
      taskEl.replaceChild(contentSpan, input);
      saveTasks();
    };

    input.onkeydown = (e) => {
      if (e.key === "Enter") input.blur();
    };
  };

  const badge = document.createElement("span");
  badge.className = "badge " + task.priority.toLowerCase();
  badge.textContent = task.priority;

  const timestamp = document.createElement("div");
  timestamp.className = "timestamp";
  timestamp.textContent = new Date(task.timestamp).toLocaleString();

  const del = document.createElement("button");
  del.className = "delete";
  del.textContent = "×";
  del.onclick = () => {
    tasks = tasks.filter(t => t.id !== task.id);
    taskEl.remove();
    saveTasks();
  };

  taskEl.appendChild(contentSpan);
  taskEl.appendChild(badge);
  taskEl.appendChild(timestamp);
  taskEl.appendChild(del);

  return taskEl;
}

function addTask() {
  const input = document.getElementById("taskInput");
  const priority = document.getElementById("prioritySelect").value;

  if (!input.value.trim()) return;

  const task = {
    id: Date.now().toString(),
    text: input.value,
    status: "todo",
    priority: priority,
    timestamp: new Date().toISOString()
  };

  tasks.push(task);
  saveTasks();

  const col = document.getElementById("todo");
  col.appendChild(createTaskElement(task));
  sortTasksInColumn("todo"); // 🔄 Auto-sort new task
  input.value = "";
}

// 🆕 Sort by priority after adding/dropping
function sortTasksInColumn(columnId) {
  const column = document.getElementById(columnId);
  const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };

  const taskElements = Array.from(column.querySelectorAll(".task"));
  taskElements.sort((a, b) => {
    const p1 = priorityOrder[a.dataset.priority] || 3;
    const p2 = priorityOrder[b.dataset.priority] || 3;
    return p1 - p2;
  });

  taskElements.forEach(task => column.appendChild(task)); // Reorder DOM
}

// Initial load with sorting
tasks.forEach(task => {
  const col = document.getElementById(task.status);
  if (col) col.appendChild(createTaskElement(task));
});
["todo", "inprogress", "done"].forEach(sortTasksInColumn); // Initial sort
