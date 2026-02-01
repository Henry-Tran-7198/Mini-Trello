import axios from "./axios";

export const columnApi = {
  /**
   * Tạo column mới
   * @param {Object} data - { boardId, title }
   * @returns {Promise}
   */
  create(data) {
    return axios.post("/columns", data);
  },

  /**
   * Sửa tên column
   * @param {string|number} columnId - ID của column
   * @param {Object} data - { title }
   * @returns {Promise}
   */
  update(columnId, data) {
    return axios.put(`/columns/${columnId}`, data);
  },

  /**
   * Xóa column
   * @param {string|number} columnId - ID của column
   * @returns {Promise}
   */
  delete(columnId) {
    return axios.delete(`/columns/${columnId}`);
  },
};
