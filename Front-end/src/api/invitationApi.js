import axios from "./axios";

export const invitationApi = {
  /**
   * Lấy danh sách lời mời chờ
   * @returns {Promise}
   */
  getInvitations() {
    return axios.get("/invitations");
  },

  /**
   * Chấp nhận lời mời
   * @param {string|number} invitationId - ID của lời mời
   * @returns {Promise}
   */
  acceptInvitation(invitationId) {
    return axios.post(`/invitations/${invitationId}/accept`);
  },

  /**
   * Từ chối lời mời
   * @param {string|number} invitationId - ID của lời mời
   * @returns {Promise}
   */
  rejectInvitation(invitationId) {
    return axios.post(`/invitations/${invitationId}/reject`);
  },
};
