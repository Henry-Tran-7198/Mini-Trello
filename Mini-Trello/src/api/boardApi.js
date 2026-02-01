import axios from "./axios";

export const boardApi = {
  /**
   * Lấy danh sách tất cả boards của user hiện tại
   * @returns {Promise}
   */
  getBoards() {
    return axios.get("/boards");
  },

  /**
   * Tạo board mới
   * @param {Object} data - { title, description, type }
   * @returns {Promise}
   */
  create(data) {
    return axios.post("/boards", data);
  },

  /**
   * Lấy chi tiết board cùng với columns và cards
   * @param {string|number} boardId - ID của board
   * @returns {Promise}
   */
  getBoard(boardId) {
    return axios.get(`/boards/${boardId}`);
  },

  /**
   * Sửa thông tin board
   * @param {string|number} boardId - ID của board
   * @param {Object} data - { title, description, type }
   * @returns {Promise}
   */
  update(boardId, data) {
    return axios.put(`/boards/${boardId}`, data);
  },

  /**
   * Xóa board
   * @param {string|number} boardId - ID của board
   * @returns {Promise}
   */
  delete(boardId) {
    return axios.delete(`/boards/${boardId}`);
  },
};
