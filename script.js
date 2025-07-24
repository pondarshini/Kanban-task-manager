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

  document.getElementById("todo").appendChild(createTaskElement(task));
  input.value = "";
}

// Initial load
tasks.forEach(task => {
  const col = document.getElementById(task.status);
  if (col) col.appendChild(createTaskElement(task));
});
