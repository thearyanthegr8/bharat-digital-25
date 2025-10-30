"use client";

import React, { useState, useEffect } from "react";

interface SpeechButtonProps {
  textToSpeak: string;
  buttonText?: string;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({
  textToSpeak,
  buttonText = "🔊 सुनो (Listen)",
}) => {
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSynth(window.speechSynthesis);
    }
  }, []);

  const handleSpeak = () => {
    if (!synth) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    utterance.lang = "hi-IN";

    synth.speak(utterance);
  };

  return <button onClick={handleSpeak}>{buttonText}</button>;
};

export default SpeechButton;
