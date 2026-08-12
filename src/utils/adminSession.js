export const getAdminEmail = () => {
  const direct = localStorage.getItem("adminEmail");
  if (direct) return direct;

  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData.email) return userData.email;
  } catch {
    // ignore invalid JSON
  }

  if (localStorage.getItem("userRole") === "admin") {
    const employeeEmail = localStorage.getItem("employeeEmail");
    if (employeeEmail) return employeeEmail;
  }

  return null;
};

export const getAdminName = () => {
  const direct = localStorage.getItem("adminName");
  if (direct) return direct;

  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData.name) return userData.name;
  } catch {
    // ignore invalid JSON
  }

  return "Admin";
};

export const persistAdminSession = ({ email, name, id, token }) => {
  if (token) localStorage.setItem("adminToken", token);
  if (email) localStorage.setItem("adminEmail", email);
  if (name) localStorage.setItem("adminName", name);
  if (id) localStorage.setItem("adminId", id);
  localStorage.setItem("userRole", "admin");
  if (email || name) {
    localStorage.setItem(
      "userData",
      JSON.stringify({ name: name || "Admin", email, role: "admin" })
    );
  }
};