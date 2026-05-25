/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);

  const animationRef = useRef<number>(0);

  const logoImageRef = useRef<HTMLImageElement | null>(null);

  // ==========================================
  // MATCH DATA
  // ==========================================

  const [matchData, setMatchData] = useState({
    battingTeam: "SCC",
    score: "152/3",
    overs: "16.2",
    runRate: "9.38",

    batsman1: "Kohli 72*(44)",

    batsman2: "Pandya 18*(9)",

    bowler: "Bumrah 3-21 (4)",

    currentOver: ["1", "4", ".", "W"],
  });

  //Link state for API
  const [matchLink, setMatchLink] = useState("");

  // IMPORTANT
  // Live state reference
  const matchDataRef = useRef(matchData);

  useEffect(() => {
    matchDataRef.current = matchData;
  }, [matchData]);

  // ==========================================
  // INIT
  // ==========================================

  useEffect(() => {
    // LOAD LOGO
    const logo = new Image();

    logo.onload = () => {
      logoImageRef.current = logo;
    };

    logo.src = "/logo.png";

    // startCamera();

    // startApiPolling();

    return () => {
      stopStreaming();
    };
  }, []);

  // ==========================================
  // API POLLING
  // ==========================================

  function startApiPolling() {
    function oversToDecimal(overs: string): number {
      // Remove brackets and letters
      const cleanedOvers = overs.replace(/[()a-zA-Z]/g, "");

      const [overPart, ballPart] = cleanedOvers.split(".").map(Number);

      return overPart + (ballPart || 0) / 6;
    }

    function calculateScore(runRate: number, overs: string): number {
      const decimalOvers = oversToDecimal(overs);

      return Math.round(runRate * decimalOvers);
    }

    async function fetchMatch() {
      try {
        const response = await fetch("/api/proxy");

        const data = await response.json();

        data.score= calculateScore(parseFloat(data.runRate), data.overs).toString();

        setMatchData(data);
      } catch (err) {
        console.log("API Error", err);
      }
    }

    fetchMatch();

    setInterval(fetchMatch, 5000);
  }

  // ==========================================
  // CAMERA
  // ==========================================

  async function startCamera() {

    if(!checkMatchLinkValidity()) {
      alert("Please enter a valid CricHeroes match URL");
      setMatchLink("");
      return;
    }
    startApiPolling();
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },

          width: 1280,
          height: 720,

          frameRate: {
            ideal: 15,
            max: 15,
          },
        },

        audio: true,
      });

      if (!videoRef.current) return;

      videoRef.current.srcObject = cameraStream;

      await videoRef.current.play();

      startCanvasRendering(cameraStream);
    } catch (err) {
      console.log(err);
    }
  }

  function checkMatchLinkValidity(): boolean {
    const matchlink = matchLink.trim();
    if(matchlink.length === 0) return false;

    try {
      const url = new URL(matchlink);
      return url.hostname === "cricheroes.com";
    } catch (e) {
      return false;
    }
  }



  // ==========================================
  // ROUND RECT
  // ==========================================

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.beginPath();

    ctx.moveTo(x + radius, y);

    ctx.lineTo(x + width - radius, y);

    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

    ctx.lineTo(x + width, y + height - radius);

    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

    ctx.lineTo(x + radius, y + height);

    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

    ctx.lineTo(x, y + radius);

    ctx.quadraticCurveTo(x, y, x + radius, y);

    ctx.closePath();
  }

  // ==========================================
  // CANVAS
  // ==========================================

  function startCanvasRendering(cameraStream: MediaStream) {
    const canvas: any = canvasRef.current;

    const video: any = videoRef.current;

    if (!canvas || !video) return;

    const ctx: any = canvas.getContext("2d");

    if (!ctx) return;

    // ==========================================
    // HIGH QUALITY
    // ==========================================

    const dpr = window.devicePixelRatio || 1;

    canvas.width = 1280 * dpr;

    canvas.height = 720 * dpr;

    canvas.style.width = "90%";

    canvas.style.height = "90%";

    ctx.scale(dpr, dpr);

    ctx.imageSmoothingEnabled = true;

    ctx.imageSmoothingQuality = "high";

    ctx.textBaseline = "middle";

    ctx.lineJoin = "round";

    // ==========================================
    // PRE-CREATE GRADIENT
    // ==========================================

    const gradient = ctx.createLinearGradient(0, 500, 0, 720);

    gradient.addColorStop(0, "rgba(0,0,0,0)");

    gradient.addColorStop(1, "rgba(8,0,20,0.97)");

    // ==========================================
    // RENDER FUNCTION
    // ==========================================

    function render(matchData: any) {
      if (video.readyState < 2) return;

      ctx.save();

      // CLEAR
      ctx.clearRect(0, 0, 1280, 720);

      // ==========================================
      // CAMERA
      // ==========================================

      ctx.drawImage(video, 0, 0, 1280, 720);

      // ==========================================
      // BOTTOM GRADIENT
      // ==========================================

      ctx.fillStyle = gradient;

      ctx.fillRect(0, 480, 1280, 240);

      // ==========================================
      // MAIN SCORECARD
      // ==========================================

      ctx.fillStyle = "rgba(18,0,40,0.92)";

      roundRect(ctx, 30, 540, 1220, 125, 24);

      ctx.fill();

      // ==========================================
      // BORDER
      // ==========================================

      ctx.strokeStyle = "#6E00FF";

      ctx.lineWidth = 3;

      roundRect(ctx, 30, 540, 1220, 125, 24);

      ctx.stroke();

      // ==========================================
      // TEAM SCORE
      // ==========================================

      ctx.fillStyle = "#FFFFFF";

      ctx.font = "700 30px Inter";

      ctx.fillText(`${matchData.battingTeam || 'Not Configured'} - ${matchData.score}`, 60, 585);

      // ==========================================
      // OVERS
      // ==========================================

      ctx.fillStyle = "#00C2FF";

      ctx.font = "500 26px Inter";

      ctx.fillText(`${matchData.overs}`, 65, 625);

      // ==========================================
      // RUN RATE
      // ==========================================

      ctx.fillText(`CRR ${matchData.runRate}`, 180, 625);

      // ==========================================
      // CURRENT OVER
      // ==========================================

      // matchData.currentOver.forEach(
      //   (
      //     ball: string,
      //     i: number
      //   ) => {

      //     ctx.fillStyle =
      //       ball === 'W'
      //         ? '#FF3B3B'
      //         : ball === '4'
      //         ? '#00C2FF'
      //         : ball === '6'
      //         ? '#FFB800'
      //         : '#EAEAEA';

      //     roundRect(
      //       ctx,
      //       350 + i * 60,
      //       585,
      //       42,
      //       42,
      //       12
      //     );

      //     ctx.fill();

      //     ctx.fillStyle =
      //       '#000000';

      //     ctx.font =
      //       '700 24px Inter';

      //     ctx.fillText(
      //       ball,
      //       365 + i * 60,
      //       607
      //     );
      //   }
      // );

      // ==========================================
      // DIVIDER
      // ==========================================

      ctx.strokeStyle = "rgba(255,255,255,0.15)";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(620, 555);

      ctx.lineTo(620, 645);

      ctx.stroke();

      // ==========================================
      // BATSMEN
      // ==========================================

      ctx.fillStyle = "#FFB800";

      ctx.font = "500 20px Inter";

      ctx.fillText(matchData.batsman1, 670, 585);

       ctx.fillStyle = "#FFFFFF";

      ctx.fillText(matchData.batsman2, 670, 625);

      // ==========================================
      // BOWLER
      // ==========================================

      ctx.fillStyle = "#FFB800";

      ctx.font = "600 20px Inter";

      ctx.fillText(matchData.bowler, 980, 605);

      // ==========================================
      // LIVE BADGE
      // ==========================================

      // ==========================================
      // WATERMARK
      // ==========================================

      if (logoImageRef.current && logoImageRef.current.complete) {
        ctx.globalAlpha = 1;

        ctx.drawImage(logoImageRef.current, 10, 10, 80, 80);

        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }

    // ==========================================
    // ANIMATION LOOP
    // ==========================================

    function animate() {
      render(matchDataRef.current);

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    // ==========================================
    // START STREAM
    // ==========================================

    startStreaming(canvas, cameraStream);
  }

  // ==========================================
  // STREAMING
  // ==========================================

  async function startStreaming(
    canvas: HTMLCanvasElement,
    cameraStream: MediaStream,
  ) {
    const canvasStream = canvas.captureStream(15);

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...cameraStream.getAudioTracks(),
    ]);

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerRef.current = pc;

    const videoTrack = combinedStream.getVideoTracks()[0];

    const transceiver = pc.addTransceiver(videoTrack, {
      direction: "sendonly",
    });

    // H264
    const capabilities = RTCRtpSender.getCapabilities("video");

    const h264Codec = capabilities?.codecs.find((codec) =>
      codec.mimeType.includes("H264"),
    );

    if (h264Codec) {
      transceiver.setCodecPreferences([h264Codec]);
    }

    // Bitrate
    const sender = pc.getSenders().find((s) => s.track?.kind === "video");

    if (sender) {
      const params = sender.getParameters();

      if (!params.encodings) {
        params.encodings = [{}];
      }

      params.encodings[0].maxBitrate = 1200000;

      await sender.setParameters(params);
    }

    // AUDIO
    combinedStream.getAudioTracks().forEach((track) => {
      pc.addTrack(track, combinedStream);
    });

    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    const response = await fetch("https://winnifred-destroyable-suppletorily.ngrok-free.dev/stream/whip", {
      method: "POST",

      headers: {
        "Content-Type": "application/sdp",
      },

      body: offer.sdp,
    });

    const answer = await response.text();

    await pc.setRemoteDescription({
      type: "answer",
      sdp: answer,
    });

    console.log("Streaming started");
  }

  // ==========================================
  // STOP
  // ==========================================

  function stopStreaming() {
    if (peerRef.current) {
      peerRef.current.close();

      peerRef.current = null;
    }

    cancelAnimationFrame(animationRef.current);

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;

      stream.getTracks().forEach((track) => {
        track.stop();
      });

      videoRef.current.srcObject = null;
      const ctx:any=canvasRef.current?.getContext("2d");
      ctx?.clearRect(0,0,1280,720);
    }

    

    console.log("Streaming stopped");
  }

  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative">
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />

      <canvas ref={canvasRef} className="w-full h-full" />

    <div className="absolute top-4 right-4 flex flex-col gap-4">
      CONTROLS
      <button
        onClick={startCamera}
        className="bg-green-900 hover:bg-green-600 text-white px-5 py-2 rounded-xl z-50"
      >
        START
      </button>

      <button
        onClick={stopStreaming}
        className="bg-red-900 hover:bg-red-600 text-white px-5 py-2 rounded-xl z-50"
      >
        STOP
      </button>
    </div>

    <div className="absolute bottom-4 left-20 flex gap-4">
      <input 
        className="bg-white rounded text-black p-2" 
        style={{ width: '300px' }} 
        placeholder="Enter Stream URL"
        value={matchLink}
        onChange={(e) => setMatchLink(e.target.value)}
      />
    </div>
    </main>
  );
}
