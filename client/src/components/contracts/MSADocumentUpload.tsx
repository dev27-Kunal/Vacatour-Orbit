/**
 * MSA Document Upload Component
 * Drag & drop file upload for MSA documents (unsigned and signed)
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiPost } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';

interface MSADocumentUploadProps {
  msaId: string;
  documentType: 'unsigned' | 'signed';
  currentDocumentUrl?: string;
  onUploadSuccess?: (url: string) => void;
  disabled?: boolean;
}

export function MSADocumentUpload({
  msaId,
  documentType,
  currentDocumentUrl,
  onUploadSuccess,
  disabled = false,
}: MSADocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Alleen PDF bestanden zijn toegestaan' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Bestand mag maximaal 10MB groot zijn' };
    }

    return { valid: true };
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) {return;}

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const validation = validateFile(file);

      if (!validation.valid) {
        toast({
          title: 'Ongeldig bestand',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  }, [disabled, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validation = validateFile(file);

      if (!validation.valid) {
        toast({
          title: 'Ongeldig bestand',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {return;}

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint =
        documentType === 'unsigned'
          ? `/api/vms/msa/${msaId}/upload-document`
          : `/api/vms/msa/${msaId}/upload-signed`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload mislukt');
      }

      const data = await response.json();

      toast({
        title: 'Upload succesvol',
        description: `${documentType === 'unsigned' ? 'Ongetekenede MSA' : 'Getekende MSA'} is geüpload`,
      });

      if (onUploadSuccess && data.data?.url) {
        onUploadSuccess(data.data.url);
      }

      setSelectedFile(null);
    } catch (error: any) {
      toast({
        title: 'Upload mislukt',
        description: error.message || 'Er ging iets mis tijdens het uploaden',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleDownload = () => {
    if (currentDocumentUrl) {
      window.open(currentDocumentUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {documentType === 'unsigned' ? 'MSA Document (Ongetekend)' : 'Getekend MSA Document'}
        </CardTitle>
        <CardDescription>
          {documentType === 'unsigned'
            ? 'Upload het ongetekende MSA document (PDF)'
            : 'Upload het door beide partijen getekende MSA document (PDF)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Document Display */}
        {currentDocumentUrl && !selectedFile && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Document beschikbaar
                {documentType === 'signed' && (
                  <Badge variant="default" className="ml-2">
                    Getekend
                  </Badge>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Drag & Drop Zone */}
        {!selectedFile && !currentDocumentUrl && (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
            `}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragging ? 'Drop bestand hier' : 'Sleep bestand hierheen'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">of klik om te selecteren</p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Alleen PDF bestanden (max 10MB)</p>
              </div>
            </div>
          </div>
        )}

        {/* Selected File Display */}
        {selectedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && (
                <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Uploaden... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <Button onClick={handleUpload} className="w-full" disabled={disabled}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
        )}

        {/* Replace Document Option */}
        {currentDocumentUrl && !selectedFile && (
          <Button
            variant="outline"
            onClick={() => {
              // Trigger file input
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/pdf';
              input.onchange = (e: any) => handleFileSelect(e);
              input.click();
            }}
            disabled={disabled}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Vervang Document
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
