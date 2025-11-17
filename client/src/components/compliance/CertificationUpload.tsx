/**
 * Certification Upload Component
 *
 * Form for uploading new certifications with document upload
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CertificationType } from '@/api/v2/vms/compliance/types';

const certificationSchema = z.object({
  bureauId: z.string().uuid(),
  certificationTypeId: z.string().uuid(),
  certificationNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required')
});

type CertificationFormData = z.infer<typeof certificationSchema>;

interface CertificationUploadProps {
  bureauId?: string;
  certificationTypes: CertificationType[];
  onSubmit: (data: CertificationFormData, files: File[]) => Promise<void>;
  onCancel?: () => void;
}

export function CertificationUpload({
  bureauId,
  certificationTypes,
  onSubmit,
  onCancel
}: CertificationUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      bureauId: bureauId || ''
    }
  });

  const selectedTypeId = watch('certificationTypeId');
  const selectedType = certificationTypes.find((t) => t.id === selectedTypeId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: CertificationFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(data, files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload certification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Certification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Certification Type */}
          <div>
            <Label htmlFor="certificationTypeId">Certification Type *</Label>
            <Select {...register('certificationTypeId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select certification type" />
              </SelectTrigger>
              <SelectContent>
                {certificationTypes
                  .filter((t) => t.isActive)
                  .map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.displayName}
                      {type.isRequired && <span className="text-red-600 ml-1">*</span>}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.certificationTypeId && (
              <p className="text-sm text-red-600 mt-1">{errors.certificationTypeId.message}</p>
            )}
          </div>

          {/* Certification Number */}
          <div>
            <Label htmlFor="certificationNumber">Certification Number</Label>
            <Input
              id="certificationNumber"
              {...register('certificationNumber')}
              placeholder="e.g., NEN-2024-12345"
            />
          </div>

          {/* Issuing Authority */}
          <div>
            <Label htmlFor="issuingAuthority">Issuing Authority</Label>
            <Input
              id="issuingAuthority"
              {...register('issuingAuthority')}
              placeholder="e.g., Stichting Normering Arbeid"
            />
          </div>

          {/* Issue Date */}
          <div>
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input id="issueDate" type="date" {...register('issueDate')} />
          </div>

          {/* Expiry Date */}
          <div>
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input id="expiryDate" type="date" {...register('expiryDate')} />
            {errors.expiryDate && (
              <p className="text-sm text-red-600 mt-1">{errors.expiryDate.message}</p>
            )}
            {selectedType && (
              <p className="text-sm text-gray-600 mt-1">
                Minimum validity: {selectedType.validationRules.minValidityDays} days
              </p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <Label>Documents</Label>
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (max {selectedType?.validationRules.maxFileSizeMb || 10}MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={selectedType?.validationRules.allowedMimeTypes.join(',') || '.pdf,.jpg,.png'}
                  multiple
                />
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Uploading...' : 'Upload Certification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
