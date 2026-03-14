import { useState } from "react";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";
import { Image } from "@heroui/image";
import "yet-another-react-lightbox/styles.css";

interface ImageGalleryProps {
  images: { src: string; alt?: string; height?: number }[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [index, setIndex] = useState(-1);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (i: number) => {
    setLoadedImages((prev) => new Set(prev).add(i));
  };

  const breakpoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpoints}
        className="flex gap-4 w-full"
        columnClassName="bg-clip-padding"
      >
        {images.map((img, i) => (
          <div key={i} className="overflow-hidden rounded-lg mb-4">
            <Image
              alt={img.alt}
              className="w-full cursor-pointer transition-transform duration-300 hover:scale-110"
              classNames={{ wrapper: "w-full", img: "w-full h-auto" }}
              loading="lazy"
              src={img.src}
              onClick={() => setIndex(i)}
              onLoad={() => handleImageLoad(i)}
            />
          </div>
        ))}
      </Masonry>

      <Lightbox
        close={() => setIndex(-1)}
        index={index}
        open={index >= 0}
        slides={images}
      />
    </>
  );
}
