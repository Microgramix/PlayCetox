import React, { useRef, useState, useEffect } from "react";
import "./VideoPlayer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faExpand } from "@fortawesome/free-solid-svg-icons";

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

  /**
   * Detecta se o navegador é Safari no iOS
   */
  const isSafariIOS = () => {
    const ua = window.navigator.userAgent;
    return /iP(hone|ad|od)/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua);
  };

  /**
   * Detecta qualquer navegador baseado em WebKit no iOS (Safari, Chrome, etc.)
   */
  const isWebKitOnIOS = () => {
    const ua = window.navigator.userAgent;
    return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/Edg/.test(ua);
  };

  /**
   * Atualiza o progresso do vídeo na barra
   */
  const updateProgress = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  /**
   * Impede o usuário de avançar ou retroceder no vídeo
   */
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

  /**
   * Monitoramento contínuo do progresso e bloqueio de seek no iOS
   */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", updateProgress);

      // Aplica monitoramento em navegadores WebKit no iOS
      if (isSafariIOS() || isWebKitOnIOS()) {
        const interval = setInterval(preventSeek, 100);
        return () => clearInterval(interval);
      }
    }
  }, []);

  /**
   * Reproduz o vídeo automaticamente se `autoplay` for true
   */
  useEffect(() => {
    if (videoRef.current && autoplay) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoplay]);

  /**
   * Alterna entre play e pause ao clicar no botão central ou no vídeo
   */
  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowPlayButton(false);

      // Entra em fullscreen automaticamente no primeiro play
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  /**
   * Alterna entre fullscreen e modo normal ao clicar no botão fullscreen
   */
  const toggleFullscreen = () => {
    if (
      document.fullscreenElement === containerRef.current ||
      document.webkitFullscreenElement === containerRef.current ||
      document.msFullscreenElement === containerRef.current
    ) {
      // Sai do fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      // Entra no fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    }
  };

  /**
   * Configura o volume do vídeo
   */
  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  /**
   * Mostra os controles temporariamente ao mover o mouse
   */
  const handleMouseMove = () => {
    setShowControls(true);

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  /**
   * Remove o timeout dos controles ao desmontar o componente
   */
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  /**
   * Escuta mensagens do iframe para acionar o fullscreen
   */
  useEffect(() => {
    const handleMessage = (event) => {
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
        poster={thumbnail} // Configura o thumbnail do vídeo
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
