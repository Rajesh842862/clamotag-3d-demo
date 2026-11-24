import { useCallback, useEffect, useRef } from "react";
import { SOUND_URL } from "../lib/data";

export type RfidAudio = (options?: { rate?: number; volume?: number }) => void;

export function useRfidAudio(): RfidAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(SOUND_URL);
    audio.preload = "auto";
    audio.volume = 0.65;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  return useCallback((options = {}) => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.playbackRate = options.rate ?? 1;
      audio.volume = options.volume ?? 0.65;
      void audio.play().catch(() => {
        // Autoplay can be blocked; the visual feedback remains complete.
      });
    } catch {
      // Audio is an enhancement, never a requirement for the simulation.
    }
  }, []);
}
