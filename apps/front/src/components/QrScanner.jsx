// apps/front/src/components/QrScanner.jsx
import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScanner({ onScan, onError, facingMode = 'environment' }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode('qr-reader');
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: facingMode },
      config,
      (decodedText) => {
        onScan(decodedText);
        html5QrCode.stop().catch(console.error);
      },
      (error) => onError?.(error)
    ).catch(console.error);

    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, [onScan, onError, facingMode]);

  return <div id="qr-reader" style={{ width: '100%' }} />;
}