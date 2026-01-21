export const API_BASE = "/api";

export const endpoints = {
  auth: {
    login: `${API_BASE}/auth/login`,
    logout: `${API_BASE}/auth/logout`,
    me: `${API_BASE}/auth/me`,
    register: `${API_BASE}/auth/register`,
  },
  courses: {
    list: `${API_BASE}/courses`,
    byId: (id: number | string) => `${API_BASE}/courses/${id}`,
    request: `${API_BASE}/courses/request`,
    myCourses: `${API_BASE}/courses/my-courses`,
    material: (id: number | string) => `${API_BASE}/courses/${id}/material`,
    enroll: (id: number | string) => `${API_BASE}/courses/${id}/enroll`,
    students: (id: number | string) => `${API_BASE}/courses/${id}/students`,
  },
  tasks: {
    listByCourse: (courseId: number | string) => `${API_BASE}/tasks/course/${courseId}`,
    create: `${API_BASE}/tasks`,
    submit: (taskId: number | string) => `${API_BASE}/tasks/${taskId}/submit`,
    submissions: (taskId: number | string) => `${API_BASE}/tasks/${taskId}/submissions`,
    grade: (submissionId: number | string) => `${API_BASE}/tasks/submissions/${submissionId}/grade`,
    mySubmissions: `${API_BASE}/tasks/my-submissions`,
  },
  admin: {
    courseRequests: `${API_BASE}/admin/course-requests`,
    approveRequest: (id: number | string) => `${API_BASE}/admin/course-requests/${id}/approve`,
    rejectRequest: (id: number | string) => `${API_BASE}/admin/course-requests/${id}/reject`,
    users: `${API_BASE}/admin/users`,
    reports: `${API_BASE}/admin/reports`,
  },
  users: {
    profile: `${API_BASE}/users/profile`,
    uploadImage: `${API_BASE}/users/profile/image`,
    topup: `${API_BASE}/users/me/topup`,
  },
} as const;
