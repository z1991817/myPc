import { useImages, useUploadImage } from "@/hooks/useImages";

export default function ExampleUsage() {
  // 使用 React Query
  const { isLoading } = useImages();
  const uploadMutation = useUploadImage();

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
