import { useImages, useUploadImage } from "@/hooks/useImages";
import { useUserStore } from "@/store/useUserStore";

export default function ExampleUsage() {
  // 使用 React Query
  const { data: images, isLoading } = useImages();
  const uploadMutation = useUploadImage();

  // 使用 Zustand
  const { user, setUser } = useUserStore();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div>
      <h1>使用示例</h1>
      <input type="file" onChange={handleUpload} />
      {isLoading && <p>加载中...</p>}
    </div>
  );
}
