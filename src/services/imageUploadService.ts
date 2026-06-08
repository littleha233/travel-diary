import { ApiClientError, apiClient } from './apiClient';

type UploadUrlResponse = {
  imageId: string;
  uploadUrl: string;
  method?: 'PUT' | 'POST';
  headers?: Record<string, string>;
};

type ConfirmImageResponse = {
  id: string;
  url?: string;
};

function getFileName(uri: string, index: number) {
  const rawName = uri.split('/').pop()?.split('?')[0];

  return rawName || `travelaround-photo-${index}.jpg`;
}

function getContentType(fileName: string) {
  if (fileName.match(/\.(png)$/i)) {
    return 'image/png';
  }
  if (fileName.match(/\.(webp)$/i)) {
    return 'image/webp';
  }
  if (fileName.match(/\.(heic|heif)$/i)) {
    return 'image/heic';
  }

  return 'image/jpeg';
}

async function uploadImage(uri: string, index: number) {
  const fileName = getFileName(uri, index);
  const contentType = getContentType(fileName);
  const uploadTarget = await apiClient.post<UploadUrlResponse>('/images/upload-url', {
    fileName,
    contentType,
    linkedType: 'check_in',
  });
  const fileResponse = await fetch(uri);
  const blob = await fileResponse.blob();
  const uploadResponse = await fetch(uploadTarget.uploadUrl, {
    method: uploadTarget.method ?? 'PUT',
    headers: {
      'Content-Type': contentType,
      ...uploadTarget.headers,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new ApiClientError({
      code: 'IMAGE_UPLOAD_FAILED',
      message: '照片上传失败，请稍后重试。',
      status: uploadResponse.status,
    });
  }

  const confirmed = await apiClient.post<ConfirmImageResponse>(`/images/${uploadTarget.imageId}/confirm`, {
    linkedType: 'check_in',
  });

  return confirmed.id || uploadTarget.imageId;
}

export async function uploadImages(uris: string[] = []) {
  const cleanUris = uris.filter(Boolean);

  if (!cleanUris.length) {
    return [];
  }

  return Promise.all(cleanUris.map((uri, index) => uploadImage(uri, index)));
}
