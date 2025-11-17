import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Download, 
  Eye, 
  X, 
  File, 
  Image, 
  FileText, 
  Archive,
  ExternalLink
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface FileAttachment {
  id: string;
  url: string;
  filename: string;
  filesize: number;
  mimetype: string;
}

interface FilePreviewProps {
  files: FileAttachment[];
  onRemove?: (fileId: string) => void;
  canRemove?: boolean;
  className?: string;
}

interface FilePreviewDialogProps {
  file: FileAttachment;
  isOpen: boolean;
  onClose: () => void;
}

const getFileIcon = (mimetype: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  }[size];

  if (mimetype.startsWith('image/')) {
    return <Image className={`${sizeClass} text-blue-500`} />;
  }
  if (mimetype === 'application/pdf') {
    return <FileText className={`${sizeClass} text-red-500`} />;
  }
  if (mimetype.includes('zip') || mimetype.includes('rar')) {
    return <Archive className={`${sizeClass} text-yellow-500`} />;
  }
  if (mimetype.includes('word')) {
    return <FileText className={`${sizeClass} text-blue-600`} />;
  }
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
    return <FileText className={`${sizeClass} text-green-600`} />;
  }
  return <File className={`${sizeClass} text-gray-500`} />;
};

const isPreviewable = (mimetype: string): boolean => {
  const previewableTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ];
  return previewableTypes.includes(mimetype);
};

const FilePreviewDialog = ({ file, isOpen, onClose }: FilePreviewDialogProps) => {
  const canPreview = isPreviewable(file.mimetype);

  const renderPreview = () => {
    if (file.mimetype.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img 
            src={file.url} 
            alt={file.filename}
            className="max-w-full max-h-[60vh] object-contain rounded"
          />
        </div>
      );
    }
    
    if (file.mimetype === 'application/pdf') {
      return (
        <div className="w-full h-[60vh]">
          <iframe 
            src={file.url}
            title={file.filename}
            className="w-full h-full border rounded"
          />
        </div>
      );
    }
    
    if (file.mimetype === 'text/plain') {
      return (
        <div className="w-full h-[60vh] border rounded bg-background dark:bg-gray-900 p-4 overflow-auto">
          <iframe 
            src={file.url}
            title={file.filename}
            className="w-full h-full border-none"
          />
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        {getFileIcon(file.mimetype, 'lg')}
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Dit bestandstype kan niet worden voorbekeken
        </p>
        <Button 
          onClick={() => window.open(file.url, '_blank')}
          className="mt-4"
          variant="outline"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Openen in nieuwe tab
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon(file.mimetype)}
            <span className="truncate">{file.filename}</span>
            <span className="text-sm text-gray-500 font-normal">
              ({formatFileSize(file.filesize)})
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {canPreview ? renderPreview() : renderPreview()}
        </div>
        
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              const a = document.createElement('a');
              a.href = file.url;
              a.download = file.filename;
              a.click();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={onClose}>
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function FilePreview({ 
  files, 
  onRemove, 
  canRemove = false, 
  className = "" 
}: FilePreviewProps) {
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);

  if (files.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {files.map((file) => (
          <Card key={file.id} className="p-3 bg-background dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon(file.mimetype)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.filesize)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 flex-shrink-0">
                {isPreviewable(file.mimetype) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewFile(file)}
                    title="Voorbekijken"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = file.url;
                    a.download = file.filename;
                    a.click();
                  }}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                {canRemove && onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(file.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Verwijderen"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {previewFile && (
        <FilePreviewDialog 
          file={previewFile}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}