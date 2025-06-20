import React, { useRef, useState, useEffect } from "react";
import "./VideoPlayer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Ícone 'faExpand' removido da importação
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

const VideoPlayer = ({ videoSrc, thumbnail, autoplay = false }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const hideControlsTimeout = useRef(null);
  const lastAllowedTime = useRef(0);

  const isSafariIOS = () => {
    const ua = window.navigator.userAgent;
    return /iP(hone|ad|od)/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua);
  };

  const isWebKitOnIOS = () => {
    const ua = window.navigator.userAgent;
    return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/Edg/.test(ua);
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

      if (currentTime > lastAllowedTime.current + 0.3) {
        videoRef.current.currentTime = lastAllowedTime.current;
      } else {
        lastAllowedTime.current = currentTime;
      }

      if (currentTime < 0) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", updateProgress);
      if (isSafariIOS() || isWebKitOnIOS()) {
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

  /**
   * Alterna entre play e pause.
   * O CÓDIGO DE FULLSCREEN FOI REMOVIDO DAQUI.
   */
  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowPlayButton(false);
      // O bloco de código que chamava requestFullscreen() foi removido.
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  /**
   * A FUNÇÃO toggleFullscreen FOI COMPLETAMENTE REMOVIDA.
   */

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

  useEffect(() => {
    const handleMessage = (event) => {
      // Esta função agora apenas dará play/pause, sem fullscreen
      if (event.data === "requestFullscreen") {
        togglePlayPause();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
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
        poster={thumbnail}
        controls={false}
        onClick={togglePlayPause}
      ></video>

      {showPlayButton && (
        <div className="center-play-button" onClick={togglePlayPause}>
          <FontAwesomeIcon icon={faPlay} />
        </div>
      )}

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
          {/* O BOTÃO DE FULLSCREEN FOI REMOVIDO DAQUI */}
        </div>
        <div className="watermark">planocetox.com</div>
      </div>
    </div>
  );
};

export default VideoPlayer;
