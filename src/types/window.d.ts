declare global {
  interface Window {
    setTreeFromPopup?: (tree: string) => void;
  }
}
