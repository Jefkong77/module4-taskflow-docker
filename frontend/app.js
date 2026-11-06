// TaskFlow frontend (Module 4, Option 2).
// Calls the TaskFlow API deployed on Render. The API URL comes from config.js,
// which Netlify writes at build time from the TASKFLOW_API_URL environment variable.
const API_BASE = (window.TASKFLOW_API_URL || "http://localhost:8080").replace(/\/$/, "");
const TASKS_URL = `${API_BASE}/api/tasks`;

const el = (id) => document.getElementById(id);
const list = el("task-list");

el("api-url").textContent = TASKS_URL;

function setStatus(state, label) {
  el("api-status").className = `dot dot-${state}`;
  el("api-label").textContent = label;
}

function showMessage(text, isError = false) {
  const box = el("message");
  box.textContent = text;
  box.classList.toggle("message-error", isError);
  box.hidden = !text;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${url} returned ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function render(tasks) {
  list.replaceChildren();
  const done = tasks.filter((t) => t.completed).length;
  el("count-total").textContent = tasks.length;
  el("count-done").textContent = done;
  el("count-pending").textContent = tasks.length - done;
  el("empty").hidden = tasks.length > 0;

  // Pending first, then completed; newest id first within each group.
  const sorted = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed) || b.id - a.id,
  );

  for (const task of sorted) {
    const item = document.createElement("li");
    item.className = task.completed ? "task task-done" : "task";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title; // textContent, never innerHTML: titles are user data

    const id = document.createElement("span");
    id.className = "task-id";
    id.textContent = `#${task.id}`;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    if (!task.completed) {
      const complete = document.createElement("button");
      complete.type = "button";
      complete.textContent = "Complete";
      complete.addEventListener("click", () =>
        act(() => request(`${TASKS_URL}/${task.id}/complete`, { method: "PUT" })),
      );
      actions.append(complete);
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "Delete";
    remove.addEventListener("click", () =>
      act(() => request(`${TASKS_URL}/${task.id}`, { method: "DELETE" })),
    );
    actions.append(remove);

    item.append(id, title, actions);
    list.append(item);
  }
}

async function load() {
  try {
    const tasks = await request(TASKS_URL);
    render(tasks);
    setStatus("ok", "API online");
    showMessage("");
  } catch (err) {
    setStatus("down", "API unreachable");
    showMessage(
      `Could not load tasks (${err.message}). If the API is waking up on Render, wait a minute and refresh. ` +
        "If the browser console shows a CORS error, add this site's URL to CORS_ALLOWED_ORIGINS on Render.",
      true,
    );
  }
}

async function act(fn) {
  try {
    await fn();
    await load();
  } catch (err) {
    showMessage(err.message, true);
  }
}

el("new-task").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = el("title");
  const title = input.value.trim();
  if (!title) return;
  act(async () => {
    await request(TASKS_URL, { method: "POST", body: JSON.stringify({ title }) });
    input.value = "";
  });
});

load();
