import axios from 'axios';
import api from './api';

type UploadResult = {
  secureUrl: string;
  publicId?: string;
  bytes?: number;
};

type SignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder?: string;
  signature: string;
};

export async function getCloudinarySignature(folder?: string): Promise<SignResponse> {
  const { data } = await api.post('/uploads/cloudinary/sign', { folder });
  return data.data;
}

export async function uploadToCloudinary(
  file: File,
  opts: { folder?: string; onProgress?: (percent: number) => void } = {}
): Promise<UploadResult> {
  const { folder, onProgress } = opts;
  const sig = await getCloudinarySignature(folder);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  if (sig.folder) form.append('folder', sig.folder);
  form.append('signature', sig.signature);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
    form,
    {
      onUploadProgress: (evt) => {
        if (!evt.total || !onProgress) return;
        const percent = Math.round((evt.loaded / evt.total) * 100);
        onProgress(percent);
      }
    }
  );

  return {
    secureUrl: res.data?.secure_url || res.data?.url,
    publicId: res.data?.public_id,
    bytes: res.data?.bytes
  };
}
