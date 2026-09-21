import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  initialUrl?: string;
  primaryColor?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSave, initialUrl, primaryColor = '#0f766e' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = primaryColor;

    if (initialUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSigned(true);
      };
      img.src = initialUrl;
    }
  }, [initialUrl, primaryColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL());
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onSave('');
  };

  return (
    <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-teal-600" /> Draw Electronic Signature
        </label>
        {hasSigned && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-0.5 rounded border border-rose-200 hover:bg-rose-50"
          >
            <Eraser className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="relative bg-white rounded-lg border border-slate-200 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={450}
          height={120}
          className="w-full h-28 touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSigned && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic">
            Sign here using touch screen or mouse pointer
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
        <span>By signing, you agree to the binding loan agreement terms.</span>
        {hasSigned && (
          <span className="text-teal-600 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Signature Captured
          </span>
        )}
      </div>
    </div>
  );
};
