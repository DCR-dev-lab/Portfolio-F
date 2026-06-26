import api from "./api";

// PUBLIC
export const getSkills = () => {
  return api.get("/skills");
};

// ADMIN
export const getAdminSkills = () => {
  return api.get("/admin/dashboard/skills");
};

export const createSkill = (data) => {
  return api.post("/admin/dashboard/skills", data);
};

export const updateSkill = (id, data) => {
  return api.put(`/admin/dashboard/skills/${id}`, data);
};

export const deleteSkill = (id) => {
  return api.delete(`/admin/dashboard/skills/${id}`);
};
