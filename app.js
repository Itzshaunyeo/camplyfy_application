// LocalStorage Setup
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || ["All Classes"];
let classColors = JSON.parse(localStorage.getItem("classColors")) || {};
let editingTaskId = null;

const taskList = document.getElementById("taskList");
const classFilters = document.getElementById("classFilters");

// Preset color palette
const presetColors = ["#3b73ff", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6"];

// Render Everything
renderFilters();
renderTasks("All Classes");

// FILTER BUTTONS
function renderFilters() {
  classFilters.innerHTML = "";

  classes.forEach(cls => {
    const btn = document.createElement("div");
    btn.className = "filter-btn";
    btn.style.display = "flex";
    btn.style.flexDirection = "column";
    btn.style.alignItems = "center";
    btn.style.gap = "6px";
    btn.style.padding = "6px 12px";
    btn.style.cursor = "pointer";

    // Class name text
    const text = document.createElement("span");
    text.textContent = cls;
    btn.appendChild(text);

    // COLOR DOTS
    if (cls !== "All Classes") {
      const dotRow = document.createElement("div");
      dotRow.style.display = "flex";
      dotRow.style.gap = "4px";
      dotRow.style.marginTop = "4px";

      presetColors.forEach(color => {
        const dot = document.createElement("div");
        dot.style.width = "14px";
        dot.style.height = "14px";
        dot.style.borderRadius = "50%";
        dot.style.background = color;
        dot.style.cursor = "pointer";
        dot.style.border = "2px solid white";
        dot.style.boxShadow = "0 0 2px rgba(0,0,0,0.4)";

        // Highlight selected color
        if (classColors[cls] === color) {
          dot.style.outline = "2px solid black";
        }

        dot.onclick = (e) => {
          e.stopPropagation(); // don’t trigger filter click
          classColors[cls] = color;
          saveClassColors();
          renderTasks(getActiveFilter());
          renderFilters(); // refresh highlighting
        };

        dotRow.appendChild(dot);
      });

      btn.appendChild(dotRow);
    }

    // Active filter logic
    if (cls === "All Classes") btn.classList.add("active");

    btn.onclick = (e) => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTasks(cls);
    };

    classFilters.appendChild(btn);
  });

  // Add Class Button
  const addClassBtn = document.createElement("button");
  addClassBtn.className = "filter-btn";
  addClassBtn.textContent = "+ Add Class";

  addClassBtn.onclick = () => {
    const newClass = prompt("Enter class name:");
    if (newClass && !classes.includes(newClass)) {
      classes.push(newClass);
      classColors[newClass] = presetColors[0]; // default to first color
      saveClasses();
      saveClassColors();
      renderFilters();
    }
  };

  classFilters.appendChild(addClassBtn);
}

// Get active filter name
function getActiveFilter() {
  const active = document.querySelector(".filter-btn.active");
  return active ? active.textContent.replace("+ Add Class", "") : "All Classes";
}

// TASK RENDERER
function renderTasks(filter) {
  taskList.innerHTML = "";

  tasks
    .filter(t => filter === "All Classes" || t.class === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(task => createTaskCard(task));
}

// Get class color
function getClassColor(cls) {
  return classColors[cls] || "#3b73ff";
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

      <span class="badge" style="background:${getClassColor(task.class)}">
        ${task.class}
      </span>
      <span class="badge badge-blue">${daysLeft(task.date)}</span>
    </div>

    <div class="task-actions">
      <button onclick="editTask(${task.id})" title="Edit">✏️</button>
      <button onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
    </div>
  `;

  taskList.appendChild(card);
}

// TASK MODAL
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

// DELETE TASK
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks(getActiveFilter());
}

// EDIT TASK
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) openModal(task);
}

// STORAGE
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveClasses() {
  localStorage.setItem("classes", JSON.stringify(classes));
}

function saveClassColors() {
  localStorage.setItem("classColors", JSON.stringify(classColors));
}
