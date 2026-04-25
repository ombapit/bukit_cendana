"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface Props {
  onResult: (text: string) => void;
  onClose: () => void;
}

export function QRScanner({ onResult, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const resultSentRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // state 2 = SCANNING, state 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const id = "qr-scanner-region";

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(id);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (text) => {
            if (!resultSentRef.current) {
              resultSentRef.current = true;
              stopScanner().then(() => onResult(text));
            }
          },
          undefined
        );
      } catch {
        // camera denied or not available
        onClose();
      }
    }

    startScanner();
    return () => { stopScanner(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 dark:border-white/10">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Scan QR Code Warga</p>
          <button
            onClick={() => { stopScanner(); onClose(); }}
            className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-4">
          <div
            ref={containerRef}
            id="qr-scanner-region"
            className="w-full overflow-hidden rounded-xl"
          />
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
            Arahkan kamera ke QR Code warga
          </p>
        </div>
      </div>
    </div>
  );
}
