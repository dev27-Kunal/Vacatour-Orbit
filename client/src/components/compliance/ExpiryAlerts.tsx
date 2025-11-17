/**
 * Expiry Alerts Widget
 *
 * Displays upcoming certificate expirations with urgency indicators
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, XCircle, Bell } from 'lucide-react';
import type { ExpiringCertification, UrgencyLevel } from '@/api/v2/vms/compliance/types';

interface ExpiryAlertsProps {
  expiringCertifications: ExpiringCertification[];
  onViewDetails?: (cert: ExpiringCertification) => void;
  maxDisplay?: number;
}

const urgencyConfig: Record<UrgencyLevel, { color: string; icon: any; label: string }> = {
  EXPIRED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Expired' },
  CRITICAL: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: '7 days' },
  URGENT: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: '14 days' },
  WARNING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: '30 days' },
  NOTICE: { color: 'bg-blue-100 text-blue-800', icon: Bell, label: '60 days' },
  UPCOMING: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: '90 days' },
  OK: { color: 'bg-green-100 text-green-800', icon: Clock, label: 'OK' }
};

export function ExpiryAlerts({
  expiringCertifications,
  onViewDetails,
  maxDisplay = 5
}: ExpiryAlertsProps) {
  const sortedCerts = [...expiringCertifications].sort(
    (a, b) => a.daysUntilExpiry - b.daysUntilExpiry
  );

  const displayedCerts = sortedCerts.slice(0, maxDisplay);
  const criticalCount = expiringCertifications.filter(
    (c) => c.urgencyLevel === 'CRITICAL' || c.urgencyLevel === 'EXPIRED'
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Expiry Alerts</CardTitle>
          {criticalCount > 0 && (
            <Badge variant="destructive">{criticalCount} Critical</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayedCerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No expiring certifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedCerts.map((cert) => {
              const urgency = urgencyConfig[cert.urgencyLevel];
              const UrgencyIcon = urgency.icon;

              return (
                <div
                  key={cert.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={urgency.color}>
                        <UrgencyIcon className="w-3 h-3 mr-1" />
                        {cert.urgencyLevel}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{cert.certificationName}</p>
                    {cert.certificationNumber && (
                      <p className="text-xs text-gray-500">{cert.certificationNumber}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {cert.daysUntilExpiry < 0
                        ? `Expired ${Math.abs(cert.daysUntilExpiry)} days ago`
                        : `Expires in ${cert.daysUntilExpiry} days`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(cert.expiryDate).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  {onViewDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(cert)}
                    >
                      View
                    </Button>
                  )}
                </div>
              );
            })}

            {expiringCertifications.length > maxDisplay && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  +{expiringCertifications.length - maxDisplay} more expiring
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
