import axios from "./axios";

export const authApi = {
  login(data) {
    // data: { login, password }
    return axios.post("/login", data);
  },

  register(data) {
    // data: FormData with { email, username, password, password_confirmation, avatar }
    return axios.post("/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  me() {
    return axios.get("/me");
  },

  logout() {
    return axios.post("/logout");
  },

  uploadAvatar(file) {
    // file: File object
    const formData = new FormData();
    formData.append("avatar", file);
    return axios.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getNotificationPreferences() {
    return axios.get("/users/preferences/notification");
  },

  updateNotificationPreferences(preferences) {
    // preferences: { boardUpdates, cardAssignment, cardComments, cardMove, cardAttachment, emailNotifications }
    return axios.put("/users/preferences/notification", preferences);
  },
};
