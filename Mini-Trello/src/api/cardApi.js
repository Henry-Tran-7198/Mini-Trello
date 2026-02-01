import axios from "./axios";

export const cardApi = {
  /**
   * Tạo card mới
   * @param {Object} data - { boardId, columnId, title, description, cover }
   * @returns {Promise}
   */
  create(data) {
    return axios.post("/cards", data);
  },

  /**
   * Lấy chi tiết card (modal)
   * @param {string|number} cardId - ID của card
   * @returns {Promise}
   */
  getCard(cardId) {
    return axios.get(`/cards/${cardId}`);
  },

  /**
   * Sửa thông tin card
   * @param {string|number} cardId - ID của card
   * @param {Object} data - { title, description, cover }
   * @returns {Promise}
   */
  update(cardId, data) {
    return axios.put(`/cards/${cardId}`, data);
  },

  /**
   * Di chuyển card (drag & drop)
   * @param {string|number} cardId - ID của card
   * @param {Object} data - { toColumnId, orderCard }
   * @returns {Promise}
   */
  move(cardId, data) {
    return axios.patch(`/cards/${cardId}/move`, data);
  },

  /**
   * Xóa card
   * @param {string|number} cardId - ID của card
   * @returns {Promise}
   */
  delete(cardId) {
    return axios.delete(`/cards/${cardId}`);
  },
};
