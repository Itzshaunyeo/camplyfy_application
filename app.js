// LocalStorage Setup
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || ["All Classes"];

const taskList = document.getElementById("taskList");
const classFilters = document.getElementById("classFilters");

// Render Filters and Tasks
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
      localStorage.setItem("classes", JSON.stringify(classes));
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

renderFilters();
renderTasks();
