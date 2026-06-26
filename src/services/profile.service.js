import api from "./api";

// PUBLIC
export const getProfile = () => {
  return api.get("/profile");
};

// ADMIN
export const updateProfile = (data) => {
  return api.put("/admin/profile", data);
};
