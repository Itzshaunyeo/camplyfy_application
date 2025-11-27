// LocalStorage Setup
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || ["All Classes"];
let classColors = JSON.parse(localStorage.getItem("classColors")) || {};
let editingTaskId = null;

const taskList = document.getElementById("taskList");
const classFilters = document.getElementById("classFilters");

// Preset Colors
const presetColors = ["#3b73ff", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6"];

// Initial Render
renderFilters();
renderTasks("All Classes");

// RENDER FILTER BUTTONS
function renderFilters() {
  const classFilters = document.getElementById("classFilters");
  classFilters.innerHTML = "";

  // "All Classes" button
  const allBtn = document.createElement("button");
  allBtn.classList.add("filter-btn");
  allBtn.textContent = "All Classes";

  if (getActiveFilter() === "All Classes") allBtn.classList.add("active");

  allBtn.onclick = () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    allBtn.classList.add("active");
    renderTasks("All Classes");
  };

  classFilters.appendChild(allBtn);

  // Create buttons for each class
  classes.forEach(cls => {
    const btn = document.createElement("button");
    btn.classList.add("filter-btn");
    btn.textContent = cls;

    if (getActiveFilter() === cls) btn.classList.add("active");

    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTasks(cls);
    };

    // Selected color bubble (dropdown trigger)
    const colorTrigger = document.createElement("div");
    colorTrigger.style.width = "14px";
    colorTrigger.style.height = "14px";
    colorTrigger.style.borderRadius = "50%";
    colorTrigger.style.marginLeft = "8px";
    colorTrigger.style.border = "2px solid white";
    colorTrigger.style.boxShadow = "0 0 2px rgba(0,0,0,0.4)";
    colorTrigger.style.background = getClassColor(cls);
    colorTrigger.style.cursor = "pointer";
    colorTrigger.style.position = "relative";

    // Dropdown menu
    const dropdown = document.createElement("div");
    dropdown.style.position = "absolute";
    dropdown.style.top = "20px";
    dropdown.style.left = "0";
    dropdown.style.padding = "6px";
    dropdown.style.background = "#fff";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.borderRadius = "6px";
    dropdown.style.display = "none";
    dropdown.style.flexDirection = "row";
    dropdown.style.gap = "5px";
    dropdown.style.zIndex = "1000";

    // Add preset color dots into dropdown
    presetColors.forEach(color => {
      const dot = document.createElement("div");
      dot.style.width = "16px";
      dot.style.height = "16px";
      dot.style.borderRadius = "50%";
      dot.style.background = color;
      dot.style.cursor = "pointer";
      dot.style.border = "2px solid white";
      dot.style.boxShadow = "0 0 2px rgba(0,0,0,0.4)";

      dot.onclick = (e) => {
        e.stopPropagation(); // do not close dropdown
        classColors[cls] = color;
        saveClasses();
        renderFilters();
        renderTasks(getActiveFilter());
      };

      dropdown.appendChild(dot);
    });

    // Toggle dropdown on click
    colorTrigger.onclick = (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "flex" : "none";
    };

    // Close dropdown on outside click
    document.addEventListener("click", () => {
      dropdown.style.display = "none";
    });

    // Add dropdown into trigger
    colorTrigger.appendChild(dropdown);

    // Add trigger next to class name
    btn.appendChild(colorTrigger);
    classFilters.appendChild(btn);
  });
}

// Get Active Filter
function getActiveFilter() {
  const active = document.querySelector(".filter-btn.active");
  if (!active) return "All Classes";
  return active.textContent.replace("▼", "").trim();
}

// Render Tasks
function renderTasks(filter) {
  taskList.innerHTML = "";

  tasks
    .filter(t => filter === "All Classes" || t.class === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(task => createTaskCard(task));
}

function getClassColor(cls) {
  return classColors[cls] || "#3b73ff";
}

function daysLeft(date) {
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  return diff <= 0 ? "Due today" : `${diff} days left`;
}

// Create Task Card
function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";

  card.innerHTML = `
    <div class="task-left">
      <h3>${task.title}</h3>
      <p>${task.desc || ""}</p>

      <span class="badge" style="background:${getClassColor(task.class)}">
        ${task.class}
      </span>
      <span class="badge badge-blue">${daysLeft(task.date)}</span>
    </div>

    <div class="task-actions">
      <button onclick="editTask(${task.id})">✏️</button>
      <button onclick="deleteTask(${task.id})">🗑️</button>
    </div>
  `;

  taskList.appendChild(card);
}

// Modal
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

// Save Task
document.getElementById("saveTask").onclick = () => {
  const title = document.getElementById("taskTitle").value.trim();
  const desc = document.getElementById("taskDesc").value.trim();
  const cls = document.getElementById("taskClass").value.trim();
  const date = document.getElementById("taskDate").value;

  if (!title || !cls || !date) return alert("Please fill all fields.");

  if (!classes.includes(cls)) {
    classes.push(cls);
    classColors[cls] = presetColors[0];
    saveClasses();
    saveClassColors();
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
  renderTasks(getActiveFilter());
  closeModal();
};

// Delete
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks(getActiveFilter());
}

// Edit
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) openModal(task);
}

// Storage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveClasses() {
  localStorage.setItem("classes", JSON.stringify(classes));
}

function saveClassColors() {
  localStorage.setItem("classColors", JSON.stringify(classColors));
}
