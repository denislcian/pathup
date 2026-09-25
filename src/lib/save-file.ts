import { Platform, Share } from 'react-native';

/**
 * Hands a text file to the person: a download in the browser, the share sheet on the phone (to
 * save it in Files, send it by email…). Returns false if nothing could be offered.
 */
export async function saveTextFile(
  fileName: string,
  contents: string,
  mimeType = 'application/json',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof document === 'undefined') return false;
    const url = URL.createObjectURL(new Blob([contents], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Give the browser a moment to start the download before freeing the file.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }

  const result = await Share.share({ title: fileName, message: contents });
  return result.action !== Share.dismissedAction;
}
