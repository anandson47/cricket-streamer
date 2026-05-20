"use client";

import { useRef } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log(err);
      alert("Camera failed");
    }
  }

  return (
    <main className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-md rounded-xl"
      />

      <button
        onClick={startCamera}
        className="bg-red-500 text-white px-6 py-3 rounded-xl"
      >
        Start Camera
      </button>
    </main>
  );
}
