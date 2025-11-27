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
  classFilters.innerHTML = "";

  classes.forEach(cls => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "10px";

    const btn = document.createElement("div");
    btn.className = "filter-btn";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.gap = "8px";
    btn.style.padding = "6px 12px";
    btn.style.cursor = "pointer";

    // Class name text
    const label = document.createElement("span");
    label.textContent = cls;
    btn.appendChild(label);

    // Color preview dot — DROPDOWN TRIGGER
    let colorDot = null;
    if (cls !== "All Classes") {
      colorDot = document.createElement("div");
      colorDot.style.width = "14px";
      colorDot.style.height = "14px";
      colorDot.style.borderRadius = "50%";
      colorDot.style.background = getClassColor(cls);
      colorDot.style.border = "2px solid white";
      colorDot.style.boxShadow = "0 0 3px rgba(0,0,0,0.4)";
      colorDot.style.cursor = "pointer";
      btn.appendChild(colorDot);
    }

    // Dropdown (hidden)
    const dropdown = document.createElement("div");
    dropdown.style.display = "none";
    dropdown.style.position = "absolute";
    dropdown.style.top = "38px";
    dropdown.style.left = "50%";
    dropdown.style.transform = "translateX(-50%)";
    dropdown.style.background = "white";
    dropdown.style.padding = "8px";
    dropdown.style.borderRadius = "12px";
    dropdown.style.boxShadow = "0 0 6px rgba(0,0,0,0.25)";
    dropdown.style.zIndex = "999";
    dropdown.style.display = "none";
    dropdown.style.flexDirection = "row";
    dropdown.style.gap = "8px";

    if (cls !== "All Classes") {
      presetColors.forEach(color => {
        const dot = document.createElement("div");
        dot.style.width = "18px";
        dot.style.height = "18px";
        dot.style.borderRadius = "50%";
        dot.style.background = color;
        dot.style.cursor = "pointer";
        dot.style.border =
          classColors[cls] === color ? "3px solid black" : "2px solid white";

        dot.onclick = (e) => {
          e.stopPropagation();
          classColors[cls] = color;
          saveClassColors();
          renderFilters();
          renderTasks(getActiveFilter());
        };

        dropdown.appendChild(dot);
      });
    }

    // Toggle dropdown when clicking the color dot
    if (colorDot) {
      colorDot.onclick = (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "flex" ? "none" : "flex";
      };
    }

    // Click outside closes dropdown
    document.addEventListener("click", () => {
      dropdown.style.display = "none";
    });

    // Filter click
    btn.onclick = (e) => {
      if (e.target === colorDot) return;

      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTasks(cls);
    };

    wrapper.appendChild(btn);
    wrapper.appendChild(dropdown);
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
      classColors[newClass] = presetColors[0];
      saveClasses();
      saveClassColors();
      renderFilters();
    }
  };

  classFilters.appendChild(addClassBtn);
}

// Get Active Filter
function getActiveFilter() {
  const active = document.querySelector(".filter-btn.active");
  return active ? active.textContent.trim() : "All Classes";
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

