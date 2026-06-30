"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

// Browser-native voice: text-to-speech (speechSynthesis) + speech-to-text
// (SpeechRecognition). No API keys, runs in the browser.

import { useCallback, useEffect, useRef, useState } from "react";

const stripForSpeech = (text: string) =>
  text
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[*_`#>~|]/g, "")
    .replace(/[•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState({ tts: false, stt: false });
  const recRef = useRef<any>(null);

  useEffect(() => {
    const w = window as any;
    setSupported({
      tts: "speechSynthesis" in window,
      stt: !!(w.SpeechRecognition || w.webkitSpeechRecognition),
    });
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
      try {
        recRef.current?.abort?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const clean = stripForSpeech(text);
    if (!clean) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.03;
    u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stopSpeaking = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setSpeaking(false);
  }, []);

  const listen = useCallback((onFinal: (t: string) => void, onInterim?: (t: string) => void) => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      onInterim?.((finalText + interim).trim());
    };
    rec.onend = () => {
      setListening(false);
      if (finalText.trim()) onFinal(finalText.trim());
    };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  return { speak, stopSpeaking, speaking, listen, stopListening, listening, supported };
}
