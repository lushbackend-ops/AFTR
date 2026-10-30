"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckInResult } from '@/types/database';
import { useAuth } from '@/lib/auth/auth-context';
import { Camera, CameraOff, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, RotateCcw, Keyboard, Loader2 } from 'lucide-react';
import { ScrollLine } from '@/components/ui/scroll-lines';

export function TicketScanner({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const { user } = useAuth();
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'aftr-qr-reader';

  const handleVerifyCode = useCallback(async (code: string) => {
    if (!code || isVerifying) return;
    setIsVerifying(true);
    setCameraError(null);

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_code: code.trim(),
          event_id: eventId,
          staff_id: user?.role === 'organiser' ? user.id : '11111111-1111-1111-1111-111111111111',
        }),
      });

      const data = await res.json();
      setScanResult(data);

      // Audio feedback cue for door staff
      try {
        const AudioClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioClass) {
          const audioCtx = new AudioClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          if (data.status === 'valid') {
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          } else {
            osc.frequency.setValueAtTime(220, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
          }
        }
      } catch {
        // Audio API silent fallback
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Check-in validation failure';
      setScanResult({
        status: 'invalid',
        message: msg,
      });
    } finally {
      setIsVerifying(false);
    }
  }, [eventId, isVerifying, user?.id]);

  const startScanner = async () => {
    setCameraError(null);
    setScanResult(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          stopScanner();
          handleVerifyCode(decodedText);
        },
        () => {
          // Frame scan pass
        }
      );

      setScannerActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera permission denied or camera unavailable';
      setCameraError(msg);
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
        })
        .catch((err) => console.error('Error stopping scanner', err));
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleVerifyCode(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Event Header */}
      <div className="p-4 rounded-[2px] bg-theme-card border border-theme flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-sans uppercase text-theme-tertiary tracking-[0.25em] block">
            Door Verification
          </span>
          <h2 className="font-mincho text-xl font-normal text-theme-primary truncate max-w-sm">
            {eventTitle}
          </h2>
        </div>
        <span className="px-3 py-1 rounded-[50px] text-[10px] font-sans text-theme-tertiary border border-theme bg-theme-subtle">
          Staff: {user?.id.slice(0, 8)}
        </span>
      </div>

      {/* Main Scanner Box */}
      <div className="bg-theme-card p-6 sm:p-8 rounded-[2px] border border-theme space-y-6 shadow-2xl transition-colors duration-300">
        {/* Camera Display Viewport */}
        <div className="relative aspect-square max-w-sm mx-auto rounded-[2px] overflow-hidden bg-black border border-theme flex flex-col items-center justify-center">
          <div id={scannerContainerId} className="w-full h-full" />

          {!scannerActive && !scanResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-black/90">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-mincho text-white">Camera Optical Scanner</p>
                <p className="text-xs text-[#888888] font-sans max-w-xs">
                  Position attendee QR pass within the viewfinder for instantaneous validation
                </p>
              </div>
              <button
                type="button"
                onClick={startScanner}
                className="px-6 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase bg-white text-black font-medium hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
              >
                Activate Camera
              </button>
            </div>
          )}

          {scannerActive && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
              <button
                type="button"
                onClick={stopScanner}
                className="flex items-center gap-2 px-5 py-2 rounded-[50px] bg-black/80 backdrop-blur-md border border-white/30 text-xs font-sans text-white hover:bg-black cursor-pointer"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span>Pause Camera</span>
              </button>
            </div>
          )}

          {/* Verification in Progress overlay */}
          {isVerifying && (
            <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="text-xs font-sans tracking-wider text-white">Verifying cryptographic hash...</p>
            </div>
          )}
        </div>

        {/* Camera Permission Error Notice */}
        {cameraError && (
          <div className="p-4 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1 font-sans">
              <p className="font-semibold">Camera Access Restricted or Unavailable</p>
              <p className="text-zinc-400">
                Grant camera permission in browser settings, or enter the alphanumeric ticket code manually below.
              </p>
            </div>
          </div>
        )}

        {/* Scan Result Cards */}
        {scanResult && (
          <div
            className={`p-6 rounded-[2px] border text-center space-y-4 animate-in zoom-in-95 duration-200 ${
              scanResult.status === 'valid'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : scanResult.status === 'already_used'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : scanResult.status === 'cancelled'
                ? 'bg-red-500/10 border-red-500/40 text-red-300'
                : 'bg-zinc-800/50 border-red-500/40 text-red-400'
            }`}
          >
            <div className="flex justify-center">
              {scanResult.status === 'valid' && (
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}
              {scanResult.status === 'already_used' && (
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              )}
              {scanResult.status === 'cancelled' && (
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                  <XCircle className="w-8 h-8" />
                </div>
              )}
              {(scanResult.status === 'invalid' || scanResult.status === 'unauthorised') && (
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-sans uppercase tracking-[0.25em] font-medium block">
                {scanResult.status.replace('_', ' ')}
              </span>
              <h3 className="font-mincho text-2xl font-normal text-theme-primary">
                {scanResult.message}
              </h3>
            </div>

            {/* Attendee / Ticket Metadata */}
            {scanResult.attendee_name && (
              <div className="p-4 rounded-[2px] bg-theme-subtle border border-theme text-xs text-theme-secondary space-y-1.5 text-left font-sans">
                <div className="flex justify-between">
                  <span className="text-theme-tertiary">Guest:</span>
                  <span className="font-medium text-theme-primary">{scanResult.attendee_name}</span>
                </div>
                {scanResult.ticket_type && (
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Tier:</span>
                    <span className="font-medium text-theme-primary">{scanResult.ticket_type}</span>
                  </div>
                )}
                {scanResult.checked_in_at && (
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Timestamp:</span>
                    <span className="text-theme-secondary font-mono">
                      {new Date(scanResult.checked_in_at).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setScanResult(null);
                startScanner();
              }}
              className="px-6 py-2.5 rounded-[50px] text-xs font-sans font-medium uppercase tracking-widest bg-theme-primary text-theme-inverse hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scan Next Attendee</span>
            </button>
          </div>
        )}

        {/* Scroll Divider */}
        <ScrollLine direction="horizontal" origin="center" />

        {/* Manual Code Entry Fallback */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 text-xs font-sans tracking-widest text-theme-tertiary uppercase">
            <Keyboard className="w-3.5 h-3.5 text-theme-primary" />
            <span>Manual Code Entry</span>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. AFTR-DEMO-VAL1-9999"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-theme-subtle border border-theme rounded-[50px] px-5 py-2.5 text-xs font-mono text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent"
            />
            <button
              type="submit"
              disabled={isVerifying || !manualCode.trim()}
              className="px-6 py-2.5 rounded-[50px] text-xs font-sans uppercase tracking-widest font-medium bg-theme-primary text-theme-inverse hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
            >
              Verify
            </button>
          </form>

          {/* Quick Demo Code helper chips */}
          <div className="pt-2">
            <p className="text-[10px] text-theme-tertiary font-sans tracking-wider uppercase mb-2">
              Quick Test Codes:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleVerifyCode('AFTR-DEMO-VAL1-9999')}
                className="px-3 py-1 rounded-[50px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono cursor-pointer"
              >
                Valid: AFTR-DEMO-VAL1-9999
              </button>
              <button
                type="button"
                onClick={() => handleVerifyCode('AFTR-DEMO-USED-8888')}
                className="px-3 py-1 rounded-[50px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono cursor-pointer"
              >
                Used: AFTR-DEMO-USED-8888
              </button>
              <button
                type="button"
                onClick={() => handleVerifyCode('AFTR-DEMO-CANC-7777')}
                className="px-3 py-1 rounded-[50px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono cursor-pointer"
              >
                Cancelled: AFTR-DEMO-CANC-7777
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
