import { useEffect, useState } from "react";

import DefaultLayout from "@/layouts/default";
import ImageGallery from "@/components/ImageGallery";
import { getImages, ImageItem } from "@/api/images";

export default function IndexPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await getImages(1, 30);

        setImages(response.data.list);
      } catch {
        // 获取图片失败
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const galleryImages = images.map((img) => ({
    src: img.url,
    alt: img.title,
  }));

  return (
    <DefaultLayout>
      <section className="py-8 md:py-10">
        {loading ? (
          <div>加载中...</div>
        ) : (
          <ImageGallery images={galleryImages} />
        )}
      </section>
    </DefaultLayout>
  );
}
