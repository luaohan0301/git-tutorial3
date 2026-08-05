const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const counter = document.getElementById("counter");
const emptyState = document.getElementById("empty-state");
const filtersEl = document.getElementById("filters");
const clearBtn = document.getElementById("clear-completed");
const dateEl = document.getElementById("date");

let todos = loadTodos();
let currentFilter = "all";

// 显示今天日期
dateEl.textContent = new Date().toLocaleDateString("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "long",
});

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  todos.unshift({
    id: Date.now(),
    text,
    completed: false,
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function updateTodo(id, text) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.text = text;
    saveTodos();
  }
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function getVisibleTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.completed);
  if (currentFilter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

// 双击任务文字进入编辑模式
function startEditing(item, todo) {
  const textEl = item.querySelector(".todo-text");
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;
  editInput.maxLength = 120;
  textEl.replaceWith(editInput);
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    const newText = editInput.value.trim();
    if (save && newText) {
      updateTodo(todo.id, newText);
    } else {
      render();
    }
  };

  editInput.addEventListener("blur", () => finish(true));
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
}

function render() {
  const visible = getVisibleTodos();
  list.innerHTML = "";

  visible.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item" + (todo.completed ? " completed" : "");

    const check = document.createElement("button");
    check.className = "check";
    check.setAttribute("aria-label", "切换完成状态");
    check.addEventListener("click", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    text.title = "双击编辑";
    text.addEventListener("dblclick", () => startEditing(item, todo));

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✕";
    del.setAttribute("aria-label", "删除任务");
    del.addEventListener("click", () => deleteTodo(todo.id));

    item.append(check, text, del);
    list.appendChild(item);
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  counter.textContent = `${activeCount} 项进行中 / 共 ${todos.length} 项`;
  emptyState.classList.toggle("hidden", visible.length > 0);
  clearBtn.style.visibility = todos.some((t) => t.completed)
    ? "visible"
    : "hidden";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  filtersEl
    .querySelectorAll(".filter")
    .forEach((f) => f.classList.toggle("active", f === btn));
  render();
});

clearBtn.addEventListener("click", clearCompleted);

render();
