import axios from "./axios-customize";

// Auth
export const loginAPI = (payload) =>
  axios.post("/webktx/authentication/login", payload);

export const introspectAPI = () =>
  axios.post("/webktx/authentication/introspect");

export const logoutAPI = () =>
  axios.post("/webktx/authentication/logout"); 

export const refreshAPI = () =>
  axios.post("/webktx/authentication/refresh");

// Ví dụ module khác
export const listUsersAPI = (page = 1, pageSize = 20) =>
  axios.get("/users", { params: { page, pageSize } });

export const createUser = (payload) =>
  axios.post("/users", payload);
