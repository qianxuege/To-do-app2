function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = Object.assign({}, options.headers || {});
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore if server returned non-JSON
  }

  if (!res.ok) {
    const detail = data?.detail || data?.non_field_errors?.[0] || "Request failed.";
    throw new Error(detail);
  }

  return data;
}

const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  });
}

const authStatus = document.getElementById("auth-status");
const loginLink = document.getElementById("login-link");

const token = getToken();
const user = getUser();
if (!token) {
  if (authStatus) authStatus.textContent = "You are not logged in.";
  if (loginLink) loginLink.style.display = "inline-block";
  if (logoutButton) logoutButton.style.display = "none";
} else {
  if (authStatus) authStatus.textContent = `Logged in as ${user?.username || "user"}`;
  if (loginLink) loginLink.style.display = "none";
  if (logoutButton) logoutButton.style.display = "inline-block";
}

const todoForm = document.getElementById("todo-form");
const todoError = document.getElementById("todo-error");
const todaysTodosEl = document.getElementById("todays-todos");
const todosListEl = document.getElementById("todos-list");

function setTodoError(msg) {
  if (todoError) todoError.textContent = msg || "";
}

function createTodoLi(todo) {
  const li = document.createElement("li");
  li.dataset.id = String(todo.id);

  const completed = Boolean(todo.completed);
  li.innerHTML = `
    <input type="checkbox" data-role="toggle-complete" data-id="${escapeHtml(todo.id)}" ${
    completed ? "checked" : ""
  } />
    <span data-role="title" style="${
    completed ? "text-decoration: line-through;" : ""
  }">${escapeHtml(todo.title)}</span>
    <small>(Due ${escapeHtml(todo.due_date)})</small>
    <button type="button" data-role="delete" data-id="${escapeHtml(todo.id)}">Delete</button>
  `;

  return li;
}

async function loadTodos() {
  if (!token) return;
  if (!todosListEl) return;
  const data = await apiFetch("/api/todos/", { method: "GET" });

  todosListEl.replaceChildren();
  if (!data.length) {
    const li = document.createElement("li");
    li.textContent = "No tasks yet.";
    todosListEl.appendChild(li);
    return;
  }

  data.forEach((todo) => todosListEl.appendChild(createTodoLi(todo)));
}

async function loadTodaysTodos() {
  if (!token) return;
  if (!todaysTodosEl) return;
  const data = await apiFetch("/api/todos/today/", { method: "GET" });

  todaysTodosEl.replaceChildren();
  if (!data.length) {
    const li = document.createElement("li");
    li.textContent = "No tasks due today. Great!";
    todaysTodosEl.appendChild(li);
    return;
  }

  data.forEach((todo) => {
    const li = document.createElement("li");
    li.textContent = `${todo.title} (Due ${todo.due_date})`;
    todaysTodosEl.appendChild(li);
  });
}

if (todoForm) {
  todoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setTodoError("");

    try {
      const title = todoForm.elements["title"].value.trim();
      const due_date = todoForm.elements["due_date"].value;
      await apiFetch("/api/todos/", {
        method: "POST",
        body: JSON.stringify({ title, due_date }),
        headers: { "Content-Type": "application/json" },
      });

      todoForm.reset();
      await Promise.all([loadTodos(), loadTodaysTodos()]);
    } catch (err) {
      setTodoError(err.message || "Could not add task.");
    }
  });
}

if (todosListEl) {
  todosListEl.addEventListener("change", async (e) => {
    const target = e.target;
    if (!target || target.getAttribute("data-role") !== "toggle-complete") return;

    const id = target.getAttribute("data-id");
    const completed = target.checked;
    setTodoError("");

    try {
      await apiFetch(`/api/todos/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
        headers: { "Content-Type": "application/json" },
      });

      await Promise.all([loadTodos(), loadTodaysTodos()]);
    } catch (err) {
      setTodoError(err.message || "Could not update task.");
      target.checked = !completed; // revert UI if update failed
    }
  });

  todosListEl.addEventListener("click", async (e) => {
    const target = e.target;
    if (!target || target.getAttribute("data-role") !== "delete") return;

    const id = target.getAttribute("data-id");
    setTodoError("");
    try {
      await apiFetch(`/api/todos/${id}/`, { method: "DELETE" });
      await Promise.all([loadTodos(), loadTodaysTodos()]);
    } catch (err) {
      setTodoError(err.message || "Could not delete task.");
    }
  });
}

if (token) {
  Promise.all([loadTodos(), loadTodaysTodos()]).catch((err) => setTodoError(err.message));
}

