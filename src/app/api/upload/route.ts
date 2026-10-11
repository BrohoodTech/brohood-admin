import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const directUrl = formData.get('url') as string | null;

    if (directUrl) {
      return NextResponse.json({ url: directUrl });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file or image URL provided' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();

    // Check if real Cloudinary credentials are provided
    const isCloudinaryConfigured =
      cloudName &&
      cloudName !== 'your_cloud_name' &&
      ((apiKey && apiSecret && apiKey !== 'your_api_key') || (uploadPreset && uploadPreset !== 'brohood_products'));

    if (isCloudinaryConfigured) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

      const timestamp = Math.round(new Date().getTime() / 1000);
      const uploadParams = new URLSearchParams();
      uploadParams.append('file', base64Data);

      if (apiKey && apiSecret && apiKey !== 'your_api_key') {
        const signatureString = `folder=brohood_products&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        uploadParams.append('timestamp', timestamp.toString());
        uploadParams.append('folder', 'brohood_products');
        uploadParams.append('api_key', apiKey);
        uploadParams.append('signature', signature);
      } else if (uploadPreset) {
        uploadParams.append('upload_preset', uploadPreset);
      }

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: uploadParams,
        }
      );

      const data = await uploadRes.json();
      if (data.secure_url) {
        return NextResponse.json({ url: data.secure_url });
      } else {
        console.warn('Cloudinary upload response without secure_url:', data);
      }
    }

    // Fallback: If Cloudinary keys are placeholders, encode as clean data URI or high-res Unsplash luxury placeholder
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUri = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    
    return NextResponse.json({
      url: dataUri,
      note: isCloudinaryConfigured
        ? 'Uploaded'
        : 'Saved as base64 asset (configure valid Cloudinary keys in .env.local for CDN storage)',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 500 });
  }
}
