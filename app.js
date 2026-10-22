let tasks = JSON.parse(localStorage.getItem("taskflow") || "[]");
let currentFilter = "all";

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem("taskflow", JSON.stringify(tasks));
}
function addTask() {
  const text = $("taskInput").value.trim();
  if (!text) return;

  tasks.unshift({
    id: Date.now(),
    text: text,
    done: false,
    priority: $("priority").value,
  });

  $("taskInput").value = "";
  save();
  render();
}

$("addBtn").addEventListener("click", addTask);
$("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  task.done = !task.done;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

$("clearBtn").addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});
function getVisibleTasks() {
  const term = $("searchInput").value.trim().toLowerCase();

  return tasks.filter((t) => {
    if (currentFilter === "active" && t.done) return false;
    if (currentFilter === "done" && !t.done) return false;
    return t.text.toLowerCase().includes(term);
  });
}

$("searchInput").addEventListener("input", render);

document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});function render() {
  const list = $("taskList");
  list.innerHTML = "";

  const visible = getVisibleTasks();

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.priority + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = task.text; // textContent keeps user input safe

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "×";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, span, del);
    list.appendChild(li);
  });

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = tasks.length ? "No matching tasks." : "No tasks yet. Add your first one above.";
    list.appendChild(empty);
  }

  // Progress
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  $("progressBar").style.width = percent + "%";
  $("progressText").textContent = `${done} of ${total} complete (${percent}%)`;
  $("summary").textContent =
    total === 0 ? "Plan today, one task at a time."
    : done === total ? "All done. Nice work!"
    : `${total - done} left to go.`;
}

render(); // draw once when the page loads