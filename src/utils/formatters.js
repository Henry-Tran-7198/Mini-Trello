//Capitalize the first letter of a string
export const capitalizeFirstLetter = (val) => {
  if (!val) return "";
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`;
};

// Phía FE sẽ tạo 1 card đặc biệt, không liên quan đến back-end dùng để giữ chỗ
// Card đặc biệt này được ẩn ở giao diện người dùng
// Quan trọng khi tạo: phải đầy đủ: (_id, boardId, columnId, FE_PlaceholderCard)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true,
  };
};
