async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const detail = data?.detail || data?.username?.[0] || data?.password?.[0] || "Request failed.";
    throw new Error(detail);
  }
  return data;
}

function setError(msg) {
  const el = document.getElementById("auth-error");
  if (el) el.textContent = msg;
}

const mode = document.body?.dataset?.mode;
const endpoint = mode === "register" ? "/api/auth/register/" : "/api/auth/login/";

const form = document.getElementById("auth-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      username: form.elements["username"].value.trim(),
      password: form.elements["password"].value,
    };
    if (mode === "register") {
      payload.email = form.elements["email"].value.trim();
    }

    try {
      const data = await postJSON(endpoint, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Could not submit form.");
    }
  });
}

