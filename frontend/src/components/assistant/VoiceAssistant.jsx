import { useEffect, useRef, useState } from "react";

const styles = `
  .va-wrapper {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    font-family: 'SF Pro Display', -apple-system, sans-serif;
  }

  .va-tooltip {
    background: rgba(20, 20, 20, 0.92);
    color: #e8e8e8;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    padding: 5px 10px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.08);
    white-space: nowrap;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  }

  .va-wrapper:hover .va-tooltip {
    opacity: 1;
    transform: translateY(0);
  }

  .va-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    outline: none;
  }

  .va-btn.idle {
    background: rgba(28, 28, 30, 0.9);
    box-shadow: 0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07);
    backdrop-filter: blur(12px);
  }

  .va-btn.listening {
    background: rgba(220, 53, 53, 0.92);
    box-shadow: 0 2px 12px rgba(220, 53, 53, 0.45), 0 0 0 0 rgba(220,53,53,0.4);
    animation: pulse-ring 1.4s ease-out infinite;
  }

  .va-btn:hover {
    transform: scale(1.08);
  }

  .va-btn:active {
    transform: scale(0.96);
  }

  .va-mic-icon {
    width: 18px;
    height: 18px;
    color: #ffffff;
    flex-shrink: 0;
  }

  .va-last-cmd {
    background: rgba(20, 20, 20, 0.88);
    color: rgba(220,220,220,0.85);
    font-size: 10.5px;
    letter-spacing: 0.03em;
    padding: 4px 10px;
    border-radius: 14px;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.06);
    animation: fadeIn 0.2s ease;
  }

  @keyframes pulse-ring {
    0%   { box-shadow: 0 2px 12px rgba(220,53,53,0.45), 0 0 0 0 rgba(220,53,53,0.4); }
    70%  { box-shadow: 0 2px 12px rgba(220,53,53,0.45), 0 0 0 10px rgba(220,53,53,0); }
    100% { box-shadow: 0 2px 12px rgba(220,53,53,0.45), 0 0 0 0 rgba(220,53,53,0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function VoiceAssistant({ videoRef }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const text =
        event.results[event.results.length - 1][0].transcript;
      setLastCommand(text);
      handleCommand(text.toLowerCase());
    };

    recognitionRef.current = recognition;
  }, []);

  function startListening() {
    recognitionRef.current.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current.stop();
    setListening(false);
  }

  function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
  }

  function handleCommand(command) {
    const player = videoRef.current;
    if (!player) return;

    if (command.includes("hello") || command.includes("hi")) {
      speak("Hello. How can I help you?");
      return;
    }
    if (command.includes("play")) {
      player.play();
      speak("Playing video");
      return;
    }
    if (command.includes("pause")) {
      player.pause();
      speak("Video paused");
      return;
    }
    if (command.includes("forward")) {
      player.forward(10);
      speak("Forwarding 10 seconds");
      return;
    }
    if (command.includes("back")) {
      player.backward(10);
      speak("Going back 10 seconds");
      return;
    }
    if (command.includes("speed up")) {
      player.setPlaybackRate(1.5);
      speak("Playback speed set to one point five");
      return;
    }
    if (command.includes("normal speed")) {
      player.setPlaybackRate(1);
      speak("Playback speed normal");
      return;
    }
    if (command.includes("mute")) {
      player.mute();
      speak("Muted");
      return;
    }
    if (command.includes("unmute")) {
      player.unmute();
      speak("Unmuted");
      return;
    }
    speak("Sorry, I did not understand that.");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="va-wrapper">
        <div className="va-tooltip">🎙 Go Hands Free</div>

        {lastCommand && (
          <div className="va-last-cmd" key={lastCommand}>
            {lastCommand}
          </div>
        )}

        <button
          className={`va-btn ${listening ? "listening" : "idle"}`}
          onClick={listening ? stopListening : startListening}
          title="Voice Assistant"
        >
          <svg className="va-mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="9" y1="22" x2="15" y2="22" />
          </svg>
        </button>
      </div>
    </>
  );
}