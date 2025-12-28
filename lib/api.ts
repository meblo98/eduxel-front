import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (data: any) => api.post("/auth/reset-password", data),
  changePassword: (data: any) => api.post("/auth/change-password", data),
};

export const establishmentAPI = {
  getAll: () => api.get("/establishments"),
  getOne: (id: number) => api.get(`/establishments/${id}`),
  create: (data: any) => api.post("/establishments", data),
  update: (id: number, data: any) => api.put(`/establishments/${id}`, data),
  delete: (id: number) => api.delete(`/establishments/${id}`),
};

export const userAPI = {
  getAll: (params?: any) => api.get("/users", { params }),
  getOne: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users", data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const studentAPI = {
  getAll: (params?: any) => api.get("/students", { params }),
  getOne: (id: number) => api.get(`/students/${id}`),
  create: (data: any) => api.post("/students", data),
  update: (id: number, data: any) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  getTrashed: (params?: any) => api.get(`/students/trashed`, { params }),
  restore: (id: number) => api.post(`/students/${id}/restore`),
  forceDelete: (id: number) => api.delete(`/students/${id}/force`),
};

export const teacherAPI = {
  getAll: (params?: any) => api.get("/teachers", { params }),
  getOne: (id: number) => api.get(`/teachers/${id}`),
  create: (data: any) => api.post("/teachers", data),
  update: (id: number, data: any) => api.put(`/teachers/${id}`, data),
  delete: (id: number) => api.delete(`/teachers/${id}`),
};

export const classAPI = {
  getAll: (params?: any) => api.get("/classes", { params }),
  getOne: (id: number) => api.get(`/classes/${id}`),
  create: (data: any) => api.post("/classes", data),
  update: (id: number, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
  deleteExpense: (id: number) => api.delete(`/expenses/${id}`),
};

export const subjectAPI = {
  getAll: (params?: any) => api.get("/subjects", { params }),
  getOne: (id: number) => api.get(`/subjects/${id}`),
  create: (data: any) => api.post("/subjects", data),
  update: (id: number, data: any) => api.put(`/subjects/${id}`, data),
  delete: (id: number) => api.delete(`/subjects/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getRecentActivity: () => api.get("/dashboard/activity"),
};

export const financeAPI = {
  getInvoices: (params?: any) => api.get("/billing/invoices", { params }),
  createInvoice: (data: any) => api.post("/billing/invoices", data),
  recordPayment: (data: any) => api.post("/billing/payments", data),
  getExpenses: (params?: any) => api.get("/expenses", { params }),
  createExpense: (data: any) => api.post("/expenses", data),
  getStats: () => api.get("/billing/stats"),
};

export const levelAPI = {
  getAll: (params?: any) => api.get("/levels", { params }),
  create: (data: any) => api.post("/levels", data),
  update: (id: number, data: any) => api.put(`/levels/${id}`, data),
  delete: (id: number) => api.delete(`/levels/${id}`),
};

export const timetableAPI = {
  getAll: (params?: any) => api.get("/timetables", { params }),
  create: (data: any) => api.post("/timetables", data),
  delete: (id: number) => api.delete(`/timetables/${id}`),
};

export const attendanceAPI = {
  getAll: (params?: any) => api.get("/attendance", { params }),
  bulkMark: (data: any) => api.post("/attendance", data),
  getByStudent: (studentId: number) =>
    api.get(`/attendance/student/${studentId}`),
};

export const roomAPI = {
  getAll: (params?: any) => api.get("/rooms", { params }),
  getOne: (id: number) => api.get(`/rooms/${id}`),
  create: (data: any) => api.post("/rooms", data),
  update: (id: number, data: any) => api.put(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`),
};

export const parentAPI = {
  getByClass: (params?: any) => api.get("/parents", { params }),
  getChildren: () => api.get("/parents/children"),
  getChildGrades: (studentId: number) => api.get(`/parents/children/${studentId}/grades`),
  getChildTimetable: (studentId: number) => api.get(`/parents/children/${studentId}/timetable`),
};
export const gradeAPI = {
  getAll: (params?: any) => api.get("/grades", { params }),
  create: (data: any) => api.post("/grades", data),
  update: (id: number, data: any) => api.put(`/grades/${id}`, data),
  delete: (id: number) => api.delete(`/grades/${id}`),
};
