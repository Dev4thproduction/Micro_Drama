import api from './api';

interface UploadOptions {
    folder?: string;
    onProgress?: (progress: number) => void;
}

export const uploadToCloudinary = async (file: File, options: UploadOptions = {}) => {
    try {
        // 1. Get Signature
        const signRes = await api.post('/uploads/cloudinary/sign', {
            folder: options.folder || 'misc'
        });
        const { signature, timestamp, cloudName, apiKey, upload_preset } = signRes.data.data || signRes.data;

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('upload_preset', upload_preset);
        if (options.folder) {
            formData.append('folder', options.folder);
        }

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Cloudinary upload failed');
        }

        const data = await response.json();

        return {
            secureUrl: data.secure_url,
            publicId: data.public_id,
            duration: data.duration,
            format: data.format,
            width: data.width,
            height: data.height
        };
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
};
