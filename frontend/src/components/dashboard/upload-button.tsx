'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiInitiateUpload, apiCompleteUpload } from '@/lib/api';
import { RiUploadCloud2Line, RiLoader4Line } from 'react-icons/ri';

interface UploadButtonProps {
  currentFolderId: string | null;
  onUploadComplete: () => void;
}

export default function UploadButton({ currentFolderId, onUploadComplete }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${file.name}...`);

      try {
        // Initiate upload
        const initRes = await apiInitiateUpload(
          file.name,
          file.size,
          file.type || 'application/octet-stream',
          currentFolderId,
        );

        if (initRes.upload_mode === 'single' && initRes.put_url) {
          // Single PUT upload
          const res = await fetch(initRes.put_url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
          });
          
          if (!res.ok) throw new Error('Failed to upload to S3');
          
          // Notify backend that upload is complete
          await apiCompleteUpload(initRes.file_id, []);
        }
      } catch (err: any) {
        console.error('Upload failed:', err);
        alert(`Failed to upload ${file.name}: ${err.detail || err.message}`);
      }
    }

    setUploading(false);
    setUploadProgress('');
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadComplete();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        onClick={handleClick}
        disabled={uploading}
        className="bg-white text-[#0a0a0a] hover:bg-white/90 h-9 px-4 rounded-lg text-[13px] font-semibold gap-2"
      >
        {uploading ? (
          <>
            <RiLoader4Line className="w-4 h-4 animate-spin" />
            <span className="max-w-[120px] truncate">{uploadProgress}</span>
          </>
        ) : (
          <>
            <RiUploadCloud2Line className="w-4 h-4" />
            Upload
          </>
        )}
      </Button>
    </>
  );
}
