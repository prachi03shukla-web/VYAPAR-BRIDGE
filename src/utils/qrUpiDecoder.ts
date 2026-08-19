import jsQR from 'jsqr';

/**
 * Extracts a UPI ID from a QR string payload (e.g. upi://pay?pa=example@upi&...)
 * or from standard UPI handles.
 */
export function extractUpiIdFromPayload(payload: string): string | null {
  if (!payload) return null;
  const decoded = decodeURIComponent(payload);

  // 1. Check for standard upi:// URI format with pa= parameter
  const upiMatch = decoded.match(/pa=([a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9.\-_]{2,64})/i);
  if (upiMatch && upiMatch[1]) {
    return upiMatch[1].trim();
  }

  // 2. Generic query string with pa=
  const paMatch = decoded.match(/[?&]pa=([^&]+)/i);
  if (paMatch && paMatch[1]) {
    return decodeURIComponent(paMatch[1]).trim();
  }

  // 3. Direct UPI ID format (user@bank, number@paytm, etc.)
  const directMatch = decoded.match(/\b([a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9.\-_]{2,30})\b/);
  if (directMatch && directMatch[1]) {
    return directMatch[1].trim();
  }

  return null;
}

/**
 * Extracts payee name (pn=...) from standard UPI URL
 */
export function extractPayeeNameFromPayload(payload: string): string | null {
  if (!payload) return null;
  try {
    const decoded = decodeURIComponent(payload);
    const pnMatch = decoded.match(/[?&]pn=([^&]+)/i);
    if (pnMatch && pnMatch[1]) {
      return decodeURIComponent(pnMatch[1].replace(/\+/g, ' ')).trim();
    }
  } catch (e) {}
  return null;
}

/**
 * Reads an Image / File / DataURL and extracts the QR Code text and UPI ID client-side
 * with zero server load.
 */
export async function decodeUpiIdFromImageFile(
  imageSource: File | Blob | string
): Promise<{ upiId: string | null; accountName: string | null; rawPayload: string | null }> {
  try {
    let dataUrl: string;

    if (typeof imageSource === 'string') {
      dataUrl = imageSource;
    } else {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageSource);
      });
    }

    // Load into HTMLImageElement
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image for QR decoding'));
      img.src = dataUrl;
    });

    // Create Canvas to extract pixel data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { upiId: null, accountName: null, rawPayload: null };

    // Scale appropriately for QR reading
    const maxDim = 1000;
    let width = img.naturalWidth || img.width || 400;
    let height = img.naturalHeight || img.height || 400;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      const extracted = extractUpiIdFromPayload(code.data);
      const payeeName = extractPayeeNameFromPayload(code.data);
      return {
        upiId: extracted,
        accountName: payeeName,
        rawPayload: code.data,
      };
    }

    // Fallback: check if the dataUrl or URL itself contains a UPI string
    const fallbackUpi = extractUpiIdFromPayload(dataUrl);
    const fallbackName = extractPayeeNameFromPayload(dataUrl);
    return {
      upiId: fallbackUpi,
      accountName: fallbackName,
      rawPayload: null,
    };
  } catch (err) {
    console.warn('Client-side QR decoding exception:', err);
    return { upiId: null, accountName: null, rawPayload: null };
  }
}
