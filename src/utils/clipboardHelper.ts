// Helper to intercept mobile keyboard GIF / Image insertion & clipboard paste events
import React from 'react';
import toast from 'react-hot-toast';

export function handleClipboardMediaPaste(
  e: React.ClipboardEvent,
  onMediaReceived: (dataUrl: string, file?: File | Blob) => void
): boolean {
  const clipboardData = e.clipboardData;
  if (!clipboardData) return false;

  // 1. Check for files / rich items (Standard Gboard / iOS keyboard GIF / image selection)
  const items = clipboardData.items;
  if (items && items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' || item.type.startsWith('image/') || item.type === 'image/gif') {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const result = event.target.result as string;
              onMediaReceived(result, file);
              toast.success('🎉 GIF / Image inserted from keyboard!');
            }
          };
          reader.readAsDataURL(file);
          return true;
        }
      }
    }
  }

  // 2. Check clipboard files directly
  if (clipboardData.files && clipboardData.files.length > 0) {
    const file = clipboardData.files[0];
    if (file && (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.gif'))) {
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          onMediaReceived(result, file);
          toast.success('🎉 GIF / Image inserted from keyboard!');
        }
      };
      reader.readAsDataURL(file);
      return true;
    }
  }

  // 3. Check if user pasted a direct GIF or Image URL link
  try {
    const pastedText = clipboardData.getData('text')?.trim();
    if (pastedText && (
      pastedText.match(/^https?:\/\/.*\.(gif|jpg|jpeg|png|webp)(\?.*)?$/i) ||
      pastedText.startsWith('data:image/') ||
      pastedText.includes('giphy.com/media/') ||
      pastedText.includes('tenor.com/')
    )) {
      onMediaReceived(pastedText);
      toast.success('🎉 Animated GIF / Image link attached!');
      return true;
    }
  } catch (err) {
    // Ignore URL parse error
  }

  return false;
}
