console.log("Campus Tasks app loaded (stub)");
document.addEventListener("DOMContentLoaded", () => {
  const taskList = document.getElementById("taskList");
  if (taskList) {
    taskList.textContent = "No tasks yet. Use 'Add New Task' to create one.";
  }
});
