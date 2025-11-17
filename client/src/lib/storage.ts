import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class SupabaseStorage {
  // Upload CV files
  static async uploadCV(userId: string, file: File): Promise<UploadResult> {
    try {
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('msword') && !file.type.includes('wordprocessingml')) {
        return { success: false, error: 'Only PDF and Word documents are allowed' };
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 5MB' };
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cv-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('cvs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('CV upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cvs')
        .getPublicUrl(data.path);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('CV upload exception:', error);
      return { success: false, error: 'Upload failed' };
    }
  }

  // Upload portfolio files
  static async uploadPortfolio(userId: string, file: File): Promise<UploadResult> {
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 10MB' };
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/portfolio-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Portfolio upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(data.path);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Portfolio upload exception:', error);
      return { success: false, error: 'Upload failed' };
    }
  }

  // Upload avatar images
  static async uploadAvatar(userId: string, file: File): Promise<UploadResult> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Only image files are allowed' };
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return { success: false, error: 'Image size must be less than 2MB' };
      }

      // Create filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Avatar upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Avatar upload exception:', error);
      return { success: false, error: 'Upload failed' };
    }
  }

  // Delete file
  static async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('File deletion error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('File deletion exception:', error);
      return false;
    }
  }

  // Get file URL
  static getFileUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}

export default SupabaseStorage;