/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

interface Window {
  electronAPI?: {
    isElectron: boolean;
    platform: string;
    openNativeFile: () => Promise<{ name: string; buffer: ArrayBuffer; path: string } | null>;
    saveNativeFile: (defaultName: string, buffer: ArrayBuffer, filters: { name: string; extensions: string[] }[]) => Promise<boolean>;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    onFileOpenedFromExplorer: (callback: (fileData: { name: string; buffer: ArrayBuffer }) => void) => void;
  };
}
