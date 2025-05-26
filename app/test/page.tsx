"use client"
import { useRef } from 'react';

export default function SimpleVideoPlayer() {
  const videoRef = useRef(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        src="/nagaland_ncc/nagaland.mp4"
        width="600"
        controls
        playsInline
        muted
      />
      <button onClick={handlePlay}>Play Video</button>
    </div>
  );
}
