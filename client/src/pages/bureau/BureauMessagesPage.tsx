/**
 * Bureau Messages Page
 *
 * Bureau messaging interface for communicating with companies and other bureaus.
 */

import React, { useEffect } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { PageWrapper } from '@/components/page-wrapper';
import { BureauMessaging } from '@/components/bureau/BureauMessaging';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useTranslation } from 'react-i18next';

export default function BureauMessagesPage() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    // Verify user is a bureau
    if (user && user.userType !== 'BUREAU') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to bureaus',
        variant: 'destructive',
      });
      setLocation('/dashboard');
      return;
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vms/bureau-dashboard">{t('navigation.dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.messages')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.messages')}</h1>
          <p className="text-muted-foreground mt-2">{t('bureauPortal.messages.description')}</p>
        </div>

        {/* Messaging Component */}
        <BureauMessaging bureauId={user.id} />
      </div>
    </PageWrapper>
  );
}
