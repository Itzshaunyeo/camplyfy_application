// LocalStorage Setup
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || ["All Classes"];
let editingTaskId = null;

const taskList = document.getElementById("taskList");
const classFilters = document.getElementById("classFilters");

// Render Everything
renderFilters();
renderTasks("All Classes");

// FILTER BUTTONS
function renderFilters() {
  classFilters.innerHTML = "";

  classes.forEach(cls => {
    const wrapper = document.createElement("div");
    wrapper.className = "filter-wrapper";

    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = cls;

    if (cls === "All Classes") btn.classList.add("active");

    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTasks(cls);
    };

    wrapper.appendChild(btn);

    // Delete Class Button (except All Classes)
    if (cls !== "All Classes") {
      const delBtn = document.createElement("span");
      delBtn.className = "delete-class";
      delBtn.textContent = "✖";
      delBtn.title = "Delete Class";

      delBtn.onclick = (e) => {
        e.stopPropagation();
        deleteClass(cls);
      };

      wrapper.appendChild(delBtn);
    }

    classFilters.appendChild(wrapper);
  });

  // Add Class Button
  const addClassBtn = document.createElement("button");
  addClassBtn.className = "filter-btn";
  addClassBtn.textContent = "+ Add Class";
  addClassBtn.onclick = () => {
    const newClass = prompt("Enter class name:");
    if (newClass && !classes.includes(newClass)) {
      classes.push(newClass);
      saveClasses();
      renderFilters();
    }
  };
  classFilters.appendChild(addClassBtn);
}

// Delete Class
function deleteClass(cls) {
  if (!confirm(`Delete class "${cls}"?`)) return;

  classes = classes.filter(c => c !== cls);
  tasks = tasks.map(t => t.class === cls ? { ...t, class: "Uncategorized" } : t);

  if (!classes.includes("Uncategorized")) {
    classes.push("Uncategorized");
  }

  saveClasses();
  saveTasks();
  renderFilters();
  renderTasks("All Classes");
}

// TASK RENDERER
function renderTasks(filter) {
  taskList.innerHTML = "";

  tasks
    .filter(t => filter === "All Classes" || t.class === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(task => createTaskCard(task));
}

// Badge color generator
function getClassColor(cls) {
  const map = {
    "Computer Science": "badge-blue",
    "Mathematics": "badge-green",
    "English Literature": "badge-yellow",
    "Uncategorized": "badge-red"
  };
  return map[cls] || "badge-blue";
}

// Calculate Days Left
function daysLeft(date) {
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  return diff <= 0 ? "Due today" : `${diff} days left`;
}

// TASK CARD
function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";

  card.innerHTML = `
    <div class="task-left">
      <h3>${task.title}</h3>
      <p>${task.desc || ""}</p>

      <span class="badge ${getClassColor(task.class)}">${task.class}</span>
      <span class="badge badge-blue">${daysLeft(task.date)}</span>
    </div>

    <div class="task-actions">
      <button onclick="editTask(${task.id})" title="Edit">✏️</button>
      <button onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
    </div>
  `;

  taskList.appendChild(card);
}

// MODAL
const modal = document.getElementById("taskModal");

document.getElementById("addTaskBtn").onclick = () => openModal();
document.getElementById("cancelModal").onclick = () => closeModal();

function openModal(task = null) {
  modal.classList.remove("hidden");

  if (task) {
    editingTaskId = task.id;
    document.getElementById("modalTitle").textContent = "Edit Task";
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.desc;
    document.getElementById("taskClass").value = task.class;
    document.getElementById("taskDate").value = task.date;
  } else {
    editingTaskId = null;
    document.getElementById("modalTitle").textContent = "Add New Task";
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskClass").value = "";
    document.getElementById("taskDate").value = "";
  }
}

function closeModal() {
  modal.classList.add("hidden");
}

// SAVE TASK
document.getElementById("saveTask").onclick = () => {
  const title = document.getElementById("taskTitle").value;
  const desc = document.getElementById("taskDesc").value;
  const cls = document.getElementById("taskClass").value;
  const date = document.getElementById("taskDate").value;

  if (!title || !cls || !date) return alert("Please fill all fields.");

  // Auto-add class if new
  if (!classes.includes(cls)) {
    classes.push(cls);
    saveClasses();
    renderFilters();
  }

  if (editingTaskId) {
    const t = tasks.find(t => t.id === editingTaskId);
    t.title = title;
    t.desc = desc;
    t.class = cls;
    t.date = date;
  } else {
    tasks.push({ id: Date.now(), title, desc, class: cls, date });
  }

  saveTasks();
  renderTasks("All Classes");
  closeModal();
};

// DELETE TASK
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks("All Classes");
}

// STORAGE
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveClasses() {
  localStorage.setItem("classes", JSON.stringify(classes));
}
