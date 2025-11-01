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

// --- Rooms ---
export const getRoomById = (id) =>
  axios.get(`/webktx/rooms/${id}`);

export const getRoomsPaged = (pageIndex = 0, pageSize = 10) =>
  axios.get("/webktx/rooms", { params: { pageIndex, pageSize } });

// search 3 fields: dormName, type, maxOccupants
export const searchRooms3 = ({ dormName, type, maxOccupants, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/_search3", {
    params: { dormName, type, maxOccupants, pageIndex, pageSize },
  });

// search 4 fields: dormName, type, maxOccupants, floor
export const searchRooms4 = ({ dormName, type, maxOccupants, floor, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/_search", {
    params: { dormName, type, maxOccupants, floor, pageIndex, pageSize },
  });

// filter từng loại một (tuỳ dùng)
export const getRoomsByDorm = ({ dormName, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/by-dorm", { params: { dormName, pageIndex, pageSize } });

export const getRoomsByType = ({ type, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/by-type", { params: { type, pageIndex, pageSize } });

export const getRoomsByMax = ({ max, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/by-max", { params: { max, pageIndex, pageSize } });

export const getRoomsByFloor = ({ floor, pageIndex = 0, pageSize = 10 }) =>
  axios.get("/webktx/rooms/by-floor", { params: { floor, pageIndex, pageSize } });

// Tên các khu (danh sách dormName)
export const getDormNames = () =>
  axios.get("/webktx/dormitories/names");

// Số tầng tối đa hiện có (int)
export const getGlobalMaxFloor = () =>
  axios.get("/webktx/rooms/max-floor");

// --- Users/Students/Rooms/Registration ---
export const getMyInfo = () => axios.get("/webktx/user/myInfo");
export const getStudentById = (id) => axios.get(`/webktx/students/${id}`);

export const createRoomRegistration = (payload) =>
  axios.post("/webktx/room-registrations/create", payload);
// payload = { studentId, roomId, requestType: "REGISTER", registrationDate: null }
export const getRegistrationsByStudentId = (id) =>
  axios.get(`/webktx/room-registrations/student/${id}`, { withCredentials: true });