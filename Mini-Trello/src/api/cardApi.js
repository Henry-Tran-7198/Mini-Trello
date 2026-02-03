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

  // ========== CARD MEMBERS ==========

  /**
   * Thêm member vào card
   * @param {string|number} cardId - ID của card
   * @param {string|number} userId - ID của user
   * @returns {Promise}
   */
  addMemberToCard(cardId, userId) {
    return axios.post("/card-members", {
      card_id: cardId,
      user_id: userId,
    });
  },

  /**
   * Xóa member khỏi card
   * @param {string|number} cardId - ID của card
   * @param {string|number} userId - ID của user
   * @returns {Promise}
   */
  removeMemberFromCard(cardId, userId) {
    return axios.delete("/card-members", {
      data: {
        card_id: cardId,
        user_id: userId,
      },
    });
  },

  // ========== COMMENTS ==========

  /**
   * Tạo comment trên card
   * @param {string|number} cardId - ID của card
   * @param {string|number} userId - ID của user
   * @param {string} content - Nội dung comment
   * @returns {Promise}
   */
  createComment(cardId, userId, content) {
    return axios.post("/comments", {
      card_id: cardId,
      user_id: userId,
      content,
    });
  },

  /**
   * Xóa comment
   * @param {string|number} commentId - ID của comment
   * @returns {Promise}
   */
  deleteComment(commentId) {
    return axios.delete(`/comments/${commentId}`);
  },

  // ========== ATTACHMENTS ==========

  /**
   * Thêm attachment vào card
   * @param {string|number} cardId - ID của card
   * @param {string} fileName - Tên file
   * @param {string} fileType - Loại file
   * @param {string} fileURL - URL của file
   * @returns {Promise}
   */
  addAttachment(cardId, fileName, fileType, fileURL) {
    return axios.post("/attachments", {
      card_id: cardId,
      fileName,
      fileType,
      fileURL,
    });
  },

  /**
   * Xóa attachment
   * @param {string|number} attachmentId - ID của attachment
   * @returns {Promise}
   */
  deleteAttachment(attachmentId) {
    return axios.delete(`/attachments/${attachmentId}`);
  },
};
