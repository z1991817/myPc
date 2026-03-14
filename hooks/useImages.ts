import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

// 使用 React Query 获取图片列表
export const useImages = () => {
  return useQuery({
    queryKey: ["images"],
    queryFn: api.getImages,
  });
};

// 上传图片
export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};
