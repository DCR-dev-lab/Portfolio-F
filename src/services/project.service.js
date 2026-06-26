import api from "./api";

// PUBLIC
export const getProjects = () => {
  return api.get("/projects");
};

// ADMIN
export const getAdminProjects = () => {
  return api.get("/admin/dashboard/projects");
};

export const createProject = (data) => {
  return api.post("/admin/dashboard/projects", data);
};

export const updateProject = (id, data) => {
  return api.put(`/admin/dashboard/projects/${id}`, data);
};

export const deleteProject = (id) => {
  return api.delete(`/admin/dashboard/projects/${id}`);
};
