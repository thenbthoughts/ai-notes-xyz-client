import React, { useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";

interface ImageOutput {
  src: string;
  alt: string;
}

export default function TestChatInput(): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null);
  const [textOutput, setTextOutput] = useState<string>("");
  const [imagesOutput, setImagesOutput] = useState<ImageOutput[]>([]);

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>): void => {
    const items = event.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        event.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          insertImage(blob);
        }
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        insertImage(file);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const insertImage = (file: File): void => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100px";
        img.style.borderRadius = "4px";
        img.style.margin = "2px";
        img.style.cursor = "pointer";
        img.onclick = () => img.remove();
        if (editorRef.current) {
          editorRef.current.appendChild(img);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (): void => {
    if (!editorRef.current) return;
    
    const nodes = editorRef.current.childNodes;
    const texts: string[] = [];
    const images: ImageOutput[] = [];

    nodes.forEach((node: ChildNode): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.trim() !== "") {
          texts.push(node.textContent);
        }
      } else if (node.nodeName === "IMG") {
        const imgElement = node as HTMLImageElement;
        images.push({
          src: imgElement.src,
          alt: `image-${images.length}`
        });
      }
    });

    setTextOutput(texts.join(" "));
    setImagesOutput(images);
  };

  const clearEditor = (): void => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setTextOutput("");
    setImagesOutput([]);
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-bold mb-3">Chat Input</h3>
      
      <div
        ref={editorRef}
        contentEditable
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border p-3 rounded min-h-[80px] focus:outline-none focus:border-blue-500"
        suppressContentEditableWarning={true}
      ></div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Send size={16} />
          Send
        </button>
        <button
          onClick={clearEditor}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          <Trash2 size={16} />
          Clear
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Paste or drag & drop images. Click images to remove them.
      </div>

      {textOutput && (
        <div className="mt-4 p-2 bg-green-50 border rounded">
          <strong>Text:</strong> {textOutput}
        </div>
      )}

      {imagesOutput.length > 0 && (
        <div className="mt-4 p-2 bg-blue-50 border rounded">
          <strong>Images:</strong> {imagesOutput.length} image(s)
        </div>
      )}
    </div>
  );
}
