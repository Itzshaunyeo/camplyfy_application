// LocalStorage Setup
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || ["All Classes"];

const taskList = document.getElementById("taskList");
const classFilters = document.getElementById("classFilters");

const modal = document.getElementById("taskModal");
const addTaskBtn = document.getElementById("addTaskBtn");
const cancelModal = document.getElementById("cancelModal");
const saveTask = document.getElementById("saveTask");

const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskClass = document.getElementById("taskClass");
const taskDate = document.getElementById("taskDate");

function saveState() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("classes", JSON.stringify(classes));
}

function renderFilters() {
  classFilters.innerHTML = "";
  classes.forEach(cls => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = cls;
    btn.onclick = () => renderTasks(cls);
    classFilters.appendChild(btn);
  });

  const addClassBtn = document.createElement("button");
  addClassBtn.className = "filter-btn";
  addClassBtn.textContent = "+ Add Class";
  addClassBtn.onclick = () => {
    const newClass = prompt("Enter class name:");
    if (newClass && !classes.includes(newClass)) {
      classes.push(newClass);
      saveState();
      renderFilters();
    }
  };
  classFilters.appendChild(addClassBtn);
}

function renderTasks(filter = "All Classes") {
  taskList.innerHTML = "";
  const filtered = tasks.filter(t => filter === "All Classes" || t.class === filter);
  if (filtered.length === 0) {
    taskList.textContent = "No tasks yet.";
    return;
  }
  filtered.forEach(t => {
    const el = document.createElement("div");
    el.textContent = `${t.title} — ${t.class} — ${t.date || ""}`;
    taskList.appendChild(el);
  });
}

function openModal() {
  document.getElementById("modalTitle").textContent = "Add New Task";
  taskTitle.value = ""; taskDesc.value = ""; taskClass.value = ""; taskDate.value = "";
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

addTaskBtn.addEventListener("click", openModal);
cancelModal.addEventListener("click", closeModal);

saveTask.addEventListener("click", () => {
  const title = taskTitle.value.trim();
  const desc = taskDesc.value.trim();
  const cls = taskClass.value.trim();
  const date = taskDate.value;

  if (!title || !cls || !date) {
    return alert("Please fill Title, Class and Date.");
  }

  if (!classes.includes(cls)) classes.push(cls);
  tasks.push({ id: Date.now(), title, desc, class: cls, date });

  saveState();
  renderFilters();
  renderTasks("All Classes");
  closeModal();
});

renderFilters();
renderTasks();
