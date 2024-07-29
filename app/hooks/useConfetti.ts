"use client";
import { useEffect, useRef } from "react";
import JSConfetti from "js-confetti";

export default function useConfetti() {
  // Singleton client.
  const ref = useRef<JSConfetti>();

  useEffect(() => {
    if (!ref.current) {
      ref.current = new JSConfetti();
    }
  }, []);

  return ref.current;
}
