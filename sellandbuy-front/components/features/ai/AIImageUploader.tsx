import React, { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { storage } from "@/lib/firebase/storage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  onImageReady: (url: string) => void;
  disabled?: boolean;
}

export function AIImageUploader({ onImageReady, disabled }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { firebaseUser } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      // 1. Compress Image (Max 1MB)
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // 2. Upload to Storage
      const userId = firebaseUser?.uid || "anonymous";
      const filename = `ai_temp/${userId}/${Date.now()}_${compressedFile.name}`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);
      
      onImageReady(url);
    } catch (err) {
      console.error("Error al comprimir/subir imagen:", err);
      alert("Error al procesar la imagen para la IA. Inténtalo de nuevo.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors 
        ${disabled ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed opacity-80' : 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer'} 
        min-h-[220px] relative overflow-hidden`}
    >
      {preview && !isUploading && (
        <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      )}
      
      {isUploading ? (
        <div className="flex flex-col items-center relative z-10">
          <Loader2 className="animate-spin text-indigo-500 mb-2" size={36} />
          <p className="text-sm font-medium text-indigo-700">Preparando imagen...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center relative z-10">
          <UploadCloud className={`${disabled ? 'text-neutral-400' : 'text-indigo-500'} mb-3`} size={40} />
          <p className={`font-semibold ${disabled ? 'text-neutral-500' : 'text-indigo-900'}`}>Sube la foto de tu producto</p>
          <p className="text-sm text-neutral-500 mt-1 max-w-[200px]">Haz clic o arrastra aquí para que la IA la analice.</p>
        </div>
      )}
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
