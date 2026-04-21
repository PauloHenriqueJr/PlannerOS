import { useCallback, useEffect, useRef, useState } from 'react';

const POMODORO_SECONDS = 25 * 60;

type WebkitAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function usePomodoro() {
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isSoundActive, setIsSoundActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopSound = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {
        // Source may already be stopped by the browser; safe to ignore.
      }
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsSoundActive(false);
  }, []);

  const toggleSound = useCallback(() => {
    if (isSoundActive) {
      stopSound();
      return;
    }

    try {
      const AudioCtxConstructor = window.AudioContext || (window as WebkitAudioWindow).webkitAudioContext;
      if (!AudioCtxConstructor) return;

      const ctx = new AudioCtxConstructor();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;

      for (let i = 0; i < bufferSize; i += 1) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      audioSourceRef.current = noiseSource;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.5;

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noiseSource.start();
      setIsSoundActive(true);
    } catch (error) {
      console.warn('Audio is not supported by this browser.', error);
      stopSound();
    }
  }, [isSoundActive, stopSound]);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isActive, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setIsActive(false);
    }
  }, [secondsLeft]);

  useEffect(() => stopSound, [stopSound]);

  const toggle = useCallback(() => {
    setIsActive((current) => !current);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setSecondsLeft(POMODORO_SECONDS);
  }, []);

  const formattedTime = `${Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;

  return {
    secondsLeft,
    formattedTime,
    isActive,
    isSoundActive,
    toggle,
    reset,
    toggleSound,
  };
}
