import axios from "./axios";

export const notificationApi = {
  /**
   * Lấy danh sách thông báo chưa đọc
   * @returns {Promise}
   */
  getNotifications() {
    return axios.get("/notifications");
  },

  /**
   * Đánh dấu thông báo đã đọc
   * @param {string|number} notificationId - ID của thông báo
   * @returns {Promise}
   */
  markAsRead(notificationId) {
    return axios.post(`/notifications/${notificationId}/read`);
  },

  /**
   * Xoá thông báo
   * @param {string|number} notificationId - ID của thông báo
   * @returns {Promise}
   */
  deleteNotification(notificationId) {
    return axios.delete(`/notifications/${notificationId}`);
  },
};
