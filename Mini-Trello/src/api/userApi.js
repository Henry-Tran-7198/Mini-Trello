import axios from "./axios";

export const userApi = {
  /**
   * Tìm kiếm users theo username hoặc email
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise}
   */
  searchUsers(query) {
    return axios.get("/users/search", {
      params: { q: query },
    });
  },

  /**
   * Lấy thông tin user theo ID
   * @param {string|number} userId - ID của user
   * @returns {Promise}
   */
  getUser(userId) {
    return axios.get(`/users/${userId}`);
  },
};
