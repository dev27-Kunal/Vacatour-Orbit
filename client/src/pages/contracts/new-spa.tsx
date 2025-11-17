import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ContractNewPlaceholderPage() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/contracts"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2"/>{t('common.back')}</Button></Link>
          <h1 className="text-2xl font-bold">{t('contracts.newTitle')}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('contracts.newPlaceholder.comingSoonTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">{t('contracts.newPlaceholder.description')}</p>
          <div className="flex gap-2">
            <Link href="/contracts/templates"><Button><FileText className="h-4 w-4 mr-2"/>{t('contracts.newPlaceholder.goToTemplates')}</Button></Link>
            <Link href="/contracts"><Button variant="outline">{t('contracts.newPlaceholder.goToOverview')}</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
