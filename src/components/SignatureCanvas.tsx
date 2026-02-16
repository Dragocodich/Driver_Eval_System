import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { RotateCcw, Check, Pen } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void;
  value?: string | null;
  disabled?: boolean;
  className?: string;
}

export function SignatureCanvas({ onSignatureChange, value, disabled = false, className = "" }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Configure drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setContext(ctx);

    // Load existing signature if provided
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value]);

  const getEventPosition = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  }, []);

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !context) return;
    
    event.preventDefault();
    setIsDrawing(true);
    
    const position = getEventPosition(event);
    lastPositionRef.current = position;
    
    context.beginPath();
    context.moveTo(position.x, position.y);
  }, [disabled, context, getEventPosition]);

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || !context || !lastPositionRef.current) return;
    
    event.preventDefault();
    const position = getEventPosition(event);
    
    context.lineTo(position.x, position.y);
    context.stroke();
    
    lastPositionRef.current = position;
    setHasSignature(true);
  }, [isDrawing, disabled, context, getEventPosition]);

  const stopDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    
    event.preventDefault();
    setIsDrawing(false);
    lastPositionRef.current = null;
    
    // Convert canvas to data URL and notify parent
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const signature = canvas.toDataURL('image/png');
      onSignatureChange(signature);
    }
  }, [isDrawing, disabled, hasSignature, onSignatureChange]);

  const clearSignature = useCallback(() => {
    if (disabled || !context) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange(null);
  }, [disabled, context, onSignatureChange]);

  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    
    const signature = canvas.toDataURL('image/png');
    onSignatureChange(signature);
  }, [hasSignature, onSignatureChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <motion.canvas
          ref={canvasRef}
          className={`border-2 border-dashed ${
            disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white'
          } rounded-lg w-full h-24 cursor-crosshair touch-none ${
            disabled ? 'pointer-events-none' : ''
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          whileHover={disabled ? {} : { scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
        
        {!hasSignature && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center space-x-2 text-gray-400">
              <Pen className="w-4 h-4" />
              <span className="text-sm">Sign here</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={disabled || !hasSignature}
          className="flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear</span>
        </Button>
        
        {hasSignature && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={saveSignature}
            disabled={disabled}
            className="flex items-center space-x-1 text-green-600 border-green-200 hover:bg-green-50"
          >
            <Check className="w-3 h-3" />
            <span>Confirm</span>
          </Button>
        )}
      </div>
    </div>
  );
}