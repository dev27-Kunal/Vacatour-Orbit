import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Archive,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface FileUploadItem {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  id?: string;
  url?: string;
}

interface FileUploadProps {
  onFileUpload: (files: FileUploadResult[]) => void;
  onUploadProgress?: (progress: number) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  disabled?: boolean;
  messageId?: string;
  applicationId?: string;
  jobId?: string;
}

interface FileUploadResult {
  id: string;
  url: string;
  filename: string;
  filesize: number;
  mimetype: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed'
];

export function FileUpload({
  onFileUpload,
  onUploadProgress,
  maxFiles = 5,
  maxFileSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_TYPES,
  disabled = false,
  messageId,
  applicationId,
  jobId
}: FileUploadProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {return <Image className="h-4 w-4" />;}
    if (mimetype === 'application/pdf') {return <FileText className="h-4 w-4" />;}
    if (mimetype.includes('zip') || mimetype.includes('rar')) {return <Archive className="h-4 w-4" />;}
    return <File className="h-4 w-4" />;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `${t('chat.file.tooBig')} ${formatFileSize(maxFileSize)}`;
    }
    
    if (!acceptedTypes.includes(file.type)) {
      return `${t('chat.file.typeError')}: ${file.type}`;
    }

    if (files.length >= maxFiles) {
      return `${t('chat.file.maxFiles')}: ${maxFiles}`;
    }

    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileUploadItem[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newFiles.push({
          file,
          progress: 0,
          status: 'uploading'
        });
      }
    });

    if (errors.length > 0) {
      toast({
        title: t('chat.file.uploadError'),
        description: errors.join(', '),
        variant: "destructive"
      });
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      uploadFiles(newFiles);
    }
  }, [files, maxFiles, maxFileSize, acceptedTypes]);

  const uploadFiles = async (filesToUpload: FileUploadItem[]) => {
    setIsUploading(true);
    const token = localStorage.getItem('auth_token');
    const successfulUploads: FileUploadResult[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const fileItem = filesToUpload[i];
        const formData = new FormData();
        formData.append('files', fileItem.file);
        
        if (messageId) {formData.append('messageId', messageId);}
        if (applicationId) {formData.append('applicationId', applicationId);}
        if (jobId) {formData.append('jobId', jobId);}

        try {
          const response = await fetch('/api/files/upload', {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || t('chat.file.uploadFailed'));
          }

          const result = await response.json();
          
          // Update file status to success
          setFiles(prev => prev.map(f => 
            f.file === fileItem.file 
              ? { ...f, status: 'success' as const, progress: 100, id: result.files[0]?.id, url: result.files[0]?.url }
              : f
          ));

          if (result.files && result.files.length > 0) {
            successfulUploads.push(result.files[0]);
          }

          // Update progress
          const overallProgress = ((i + 1) / filesToUpload.length) * 100;
          onUploadProgress?.(overallProgress);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload mislukt';
          
          // Update file status to error
          setFiles(prev => prev.map(f => 
            f.file === fileItem.file 
              ? { ...f, status: 'error' as const, error: errorMessage }
              : f
          ));

          toast({
            title: `${t('chat.file.uploadFailed')}: ${fileItem.file.name}`,
            description: errorMessage,
            variant: "destructive"
          });
        }
      }

      if (successfulUploads.length > 0) {
        onFileUpload(successfulUploads);
        toast({
          title: t('chat.file.uploadSuccess'),
          description: `${successfulUploads.length} ${t('chat.file.filesCount').toLowerCase()}`,
          variant: "default"
        });
      }

    } finally {
      setIsUploading(false);
      onUploadProgress?.(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragging) {
      setIsDragging(true);
    }
  }, [disabled, isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) {return;}

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input value to allow same file upload
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`
          border-2 border-dashed cursor-pointer transition-colors duration-200
          ${isDragging 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Upload className={`h-8 w-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="text-sm">
              <span className="font-medium">{t('chat.file.dragDrop')}</span>
              <span className="text-gray-500 block">{t('chat.file.dropHere')}</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>{t('chat.file.maxFiles')}: {maxFiles}, {t('chat.file.maxSize')}: {formatFileSize(maxFileSize)}</div>
              <div>{t('chat.file.supportedTypes')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('chat.file.filesCount')} ({files.length})</h4>
          {files.map((fileItem, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(fileItem.file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileItem.file.size)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {fileItem.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16">
                          <Progress value={fileItem.progress} className="h-2" />
                        </div>
                      </div>
                    )}
                    {fileItem.status === 'success' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {fileItem.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {fileItem.error && (
                <div className="mt-2 text-xs text-red-600">
                  {fileItem.error}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="text-sm text-gray-600 text-center">
          {t('chat.file.uploading')}
        </div>
      )}
    </div>
  );
}