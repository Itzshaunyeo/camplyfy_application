// LocalStorage Setup
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || ["All Classes"];
let editingTaskId = null;

const taskList = document.getElementById("taskList");
const classFilters = document.getElementById("classFilters");

// Render Everything
renderFilters();
renderTasks("All Classes");
updateOverallProgress();

// LightMode/DarkMode Toggle Button
document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// CLASS DROPDOWN FILLER
function populateClassDropdown(selected = "") {
  const dropdown = document.getElementById("taskClass");
  dropdown.innerHTML = "";

  classes
    .filter(c => c !== "All Classes") 
    .forEach(cls => {
      const opt = document.createElement("option");
      opt.value = cls;
      opt.textContent = cls;
      if (cls === selected) opt.selected = true;
      dropdown.appendChild(opt);
    });

  if (selected === "Unassigned") {
    const opt = document.createElement("option");
    opt.value = "Unassigned";
    opt.textContent = "Unassigned";
    opt.selected = true;
    dropdown.appendChild(opt);
  }
}

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
  tasks = tasks.map(t =>
    t.class === cls ? { ...t, class: "Unassigned" } : t
  );

  saveClasses();
  saveTasks();
  renderFilters();
  renderTasks("All Classes");
  updateOverallProgress();
}

// TASK RENDERER
function renderTasks(filter) {
  taskList.innerHTML = "";

  tasks
    .filter(t => filter === "All Classes" || t.class === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(task => createTaskCard(task));

  updateOverallProgress();
}

// Badge color generator
function getClassColor(cls) {
  const map = {
    "Computer Science": "badge-blue",
    "Mathematics": "badge-green",
    "English Literature": "badge-yellow",
    "Unassigned": "badge-red"
  };
  return map[cls] || "badge-blue";
}

// Days left
function daysLeft(date) {
  const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  return diff <= 0 ? "Due today" : `${diff} days left`;
}

// TASK CARD
function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card";

  card.innerHTML = `
    <div class="task-left-wrapper">
      <input type="checkbox" class="task-checkbox" ${task.done ? "checked" : ""} />

      <div class="task-left">
        <h3>${task.title}</h3>
        <p>${task.desc || ""}</p>

        <span class="badge ${getClassColor(task.class)}">${task.class}</span>
        <span class="badge badge-blue">${daysLeft(task.date)}</span>
      </div>
    </div>

    <div class="task-actions">
      <button onclick="editTask(${task.id})" title="Edit">✏️</button>
      <button onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
    </div>
  `;

  const checkbox = card.querySelector(".task-checkbox");
  checkbox.addEventListener("change", () => {
    task.done = checkbox.checked;
    saveTasks();
    updateOverallProgress();
  });

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
    document.getElementById("taskDate").value = task.date;
    populateClassDropdown(task.class);

  } else {
    editingTaskId = null;
    document.getElementById("modalTitle").textContent = "Add New Task";
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskDate").value = "";
    populateClassDropdown();
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

  if (editingTaskId) {
    const t = tasks.find(t => t.id === editingTaskId);
    t.title = title;
    t.desc = desc;
    t.class = cls;
    t.date = date;
  } else {
    tasks.push({
      id: Date.now(),
      title,
      desc,
      class: cls,
      date,
      done: false
    });
  }

  saveTasks();
  renderTasks("All Classes");
  updateOverallProgress();
  closeModal();
};

// DELETE TASK
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks("All Classes");
  updateOverallProgress();
}

// STORAGE
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveClasses() {
  localStorage.setItem("classes", JSON.stringify(classes));
}

// OVERALL PROGRESS UPDATE
function updateOverallProgress() {
  const fill = document.getElementById("overallProgressFill");
  const text = document.getElementById("progressText");

  if (!fill || !text) return;

  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  fill.style.width = percent + "%";
  text.textContent = percent + "% Completed";
}

// LOGIN FUNCTIONALITY
const loginScreen = document.getElementById("loginScreen");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value.trim();

  if (u !== "" && p !== "") {
    loginScreen.classList.add("hidden");
  }
});
