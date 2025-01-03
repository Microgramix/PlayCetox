import React, { useRef, useState, useEffect } from "react";
import "./VideoPlayer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faVolumeUp, faExpand } from "@fortawesome/free-solid-svg-icons";

const VideoPlayer = ({ videoSrc, autoplay = false }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef(null);
  const lastAllowedTime = useRef(0);

  // Detecta Safari no iOS
  const isSafariIOS = () => {
    const ua = window.navigator.userAgent;
    return /iP(hone|ad|od)/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua);
  };

  const updateProgress = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  const preventSeek = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;

      // Se o tempo atual for maior que o permitido, volta para o último tempo válido
      if (currentTime > lastAllowedTime.current + 0.3) {
        videoRef.current.currentTime = lastAllowedTime.current;
      } else {
        lastAllowedTime.current = currentTime; // Atualiza o último tempo permitido
      }

      // Bloqueia se for para antes do início
      if (currentTime < 0) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", updateProgress);

      // Monitoramento agressivo para Safari iOS
      if (isSafariIOS()) {
        const interval = setInterval(preventSeek, 100);
        return () => clearInterval(interval);
      }
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && autoplay) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoplay]);

  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = () => {
    if (
      document.fullscreenElement === containerRef.current ||
      document.webkitFullscreenElement === containerRef.current ||
      document.msFullscreenElement === containerRef.current
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    }
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  return (
    <div
      className="video-player-container"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        controls={false} // Remove os controles nativos
        onClick={togglePlayPause} // Clique no vídeo apenas controla o play/pause
      ></video>
      <div className="controls-container">
        <div className={`controls ${showControls ? "visible" : ""}`}>
          <button onClick={togglePlayPause}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
          />
          <button onClick={toggleFullscreen}>
            <FontAwesomeIcon icon={faExpand} />
          </button>
        </div>
        <div className="watermark">planocetox.com</div>
      </div>
    </div>
  );
};

export default VideoPlayer;
