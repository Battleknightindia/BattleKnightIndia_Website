// BackgroundTransition.tsx
import { useState, useEffect } from 'react';

interface BackgroundTransitionProps {
  imageUrl: string;
  className?: string;
}

const BackgroundTransition = ({ imageUrl, className }: BackgroundTransitionProps) => {
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [nextImage, setNextImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (imageUrl !== currentImage) {
      setNextImage(imageUrl);
      setIsTransitioning(true);
    }
  }, [imageUrl, currentImage]);

  const handleTransitionEnd = () => {
    if (nextImage) {
      setCurrentImage(nextImage);
      setNextImage(null);
    }
    setIsTransitioning(false);
  };

  return (
    <div className={`absolute inset-0 ${className}`}>
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url('${currentImage}')`,
          opacity: isTransitioning ? 0 : 1,
        }}
      />
      {nextImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: `url('${nextImage}')`,
            opacity: isTransitioning ? 1 : 0,
          }}
          onTransitionEnd={handleTransitionEnd}
        />
      )}
    </div>
  );
};

export default BackgroundTransition;