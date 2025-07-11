import React from "react";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  return (
    <div className="App">
      {/* Passa o link do vídeo e do thumbnail */}
      <VideoPlayer
        videoSrc="https://fastprint.lu/video.mp4"
        thumbnail="https://planocetox.com/wp-content/uploads/2025/01/Thumbnail.png"
      />
    </div>
  );
}

export default App;
