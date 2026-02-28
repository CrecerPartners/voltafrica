import { toast } from "sonner";

export async function shareContent(title: string, text: string, url?: string) {
  const shareData: ShareData = { title, text };
  if (url) shareData.url = url;

  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        await copyToClipboard(text + (url ? "\n" + url : ""), "Content");
      }
      return false;
    }
  }
  // Fallback
  await copyToClipboard(text + (url ? "\n" + url : ""), "Content");
  return false;
}

export function shareToWhatsApp(text: string) {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
}

export function shareToTwitter(text: string, url?: string) {
  const params = new URLSearchParams({ text });
  if (url) params.set("url", url);
  window.open(`https://twitter.com/intent/tweet?${params.toString()}`, "_blank");
}

export function shareToTelegram(text: string, url?: string) {
  const fullText = url ? `${text}\n${url}` : text;
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url || "")}&text=${encodeURIComponent(fullText)}`, "_blank");
}

export function shareToFacebook(url: string) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
}

export async function copyToClipboard(text: string, label: string) {
  await navigator.clipboard.writeText(text);
  toast.success(`${label} copied!`);
}

export function canNativeShare() {
  return typeof navigator.share === "function";
}
