import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose?: () => void;
  isActive: boolean;
}

export const QRScanner = ({ onScan, onClose, isActive }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Stop scanner when inactive
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch(() => {});
      }
      return;
    }

    // Check camera permission first
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking
        setHasPermission(true);
      } catch (err) {
        setHasPermission(false);
        setError("Camera permission denied. Please enable camera access in your browser settings.");
        return;
      }
    };

    checkPermission();

    if (!containerRef.current || !hasPermission) return;

    const scannerId = `qr-scanner-${Date.now()}`;
    containerRef.current.innerHTML = `<div id="${scannerId}"></div>`;

    setIsInitializing(true);
    setError(null);

    const html5QrCode = new Html5Qrcode(scannerId);

    html5QrCode
      .start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
            scannerRef.current = null;
            onScan(decodedText);
          });
        },
        (errorMessage) => {
          // Error callback - ignore most errors, they're just "no QR found" messages
          // Only show actual errors
          if (errorMessage && !errorMessage.includes("NotFoundException")) {
            // Don't spam errors for normal scanning
          }
        }
      )
      .then(() => {
        setIsInitializing(false);
        scannerRef.current = html5QrCode;
      })
      .catch((err) => {
        console.error("Error starting QR scanner:", err);
        setIsInitializing(false);
        setError(err.message || "Failed to start camera");
        scannerRef.current = null;
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch(() => {});
      }
    };
  }, [isActive, hasPermission, onScan]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="relative w-full">
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {hasPermission === false && (
        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-destructive text-lg font-semibold">Camera Permission Required</div>
            <p className="text-sm text-muted-foreground">
              Please allow camera access to scan QR codes. Check your browser settings.
            </p>
          </div>
        </div>
      )}

      {error && hasPermission !== false && (
        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-destructive text-lg font-semibold">Error</div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Reload Page
            </Button>
          </div>
        </div>
      )}

      {isInitializing && hasPermission && !error && (
        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Starting camera...</p>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className={`aspect-square rounded-xl overflow-hidden ${
          isInitializing || error || hasPermission === false ? "hidden" : ""
        }`}
      />
    </div>
  );
};
