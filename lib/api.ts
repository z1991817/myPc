import axios from "./axios";

// API 请求示例
export const api = {
  // 图片相关接口
  uploadImage: (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    return axios.post("/api/upload", formData);
  },

  getImages: () => axios.get("/api/images"),

  deleteImage: (id: string) => axios.delete(`/api/images/${id}`),
};
