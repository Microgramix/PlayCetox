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
      const duration = videoRef.current.duration;

      if (currentTime > duration - 0.5) {
        videoRef.current.currentTime = duration - 0.5;
      } else if (currentTime < 0) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", updateProgress);
      videoRef.current.addEventListener("timeupdate", preventSeek);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", updateProgress);
        videoRef.current.removeEventListener("timeupdate", preventSeek);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && autoplay) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoplay]);

  // Alterna entre play e pause ao clicar no vídeo
  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Alterna entre fullscreen e normal
  const toggleFullscreen = () => {
    if (
      document.fullscreenElement === containerRef.current ||
      document.webkitFullscreenElement === containerRef.current ||
      document.msFullscreenElement === containerRef.current
    ) {
      // Sair do fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      // Entrar no fullscreen
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
