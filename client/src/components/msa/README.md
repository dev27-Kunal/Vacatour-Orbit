# MSA Approval Modal Component

Complete implementation of the MSA (Master Service Agreement) approval workflow UI component.

## Overview

This module provides a comprehensive solution for displaying, reviewing, and approving/rejecting Master Service Agreements in the Vacature-ORBIT platform. It includes modal components, React Query hooks, TypeScript types, and full test coverage.

## Features

- ✅ Display MSA details (number, name, parties, financial terms, dates)
- ✅ Show approval status badges (company approved/pending, bureau approved/pending)
- ✅ Approve button with confirmation dialog
- ✅ Reject button with reason textarea (required)
- ✅ Loading states during API calls
- ✅ Error handling with toast notifications
- ✅ Responsive design (mobile-friendly)
- ✅ TypeScript type safety
- ✅ React Query integration
- ✅ Comprehensive test coverage
- ✅ Notification badge for pending approvals

## Components

### MSAApprovalModal

Main modal component for reviewing and approving/rejecting MSAs.

**Props:**

```typescript
interface MSAApprovalModalProps {
  msa: MSADocument | null;          // MSA to display (null = modal closed)
  isOpen: boolean;                  // Control modal visibility
  onClose: () => void;              // Callback when modal closes
  onSuccess?: () => void;           // Optional callback after successful action
  userType: 'BEDRIJF' | 'BUREAU';   // Current user type for approval logic
}
```

**Usage:**

```tsx
import { MSAApprovalModal } from '@/components/msa/MSAApprovalModal';
import { MSADocument } from '@/types/msa';
import { useState } from 'react';

function MyComponent() {
  const [selectedMSA, setSelectedMSA] = useState<MSADocument | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MSAApprovalModal
      msa={selectedMSA}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSuccess={() => console.log('Action completed')}
      userType="BEDRIJF"
    />
  );
}
```

### MSANotificationBadge

Notification badge showing pending MSA count, can be placed in navigation or notification areas.

**Props:**

```typescript
interface MSANotificationBadgeProps {
  onClick?: () => void;              // Callback when badge clicked
  variant?: 'icon' | 'badge' | 'button';  // Display style
  className?: string;                // Additional CSS classes
}
```

**Usage:**

```tsx
import { MSANotificationBadge } from '@/components/msa/MSANotificationBadge';
import { useLocation } from 'wouter';

function Navigation() {
  const [, setLocation] = useLocation();

  return (
    <nav>
      {/* Icon variant - small notification dot */}
      <MSANotificationBadge
        variant="icon"
        onClick={() => setLocation('/msa-approvals')}
      />

      {/* Badge variant - shows count */}
      <MSANotificationBadge
        variant="badge"
        onClick={() => setLocation('/msa-approvals')}
      />

      {/* Button variant - full button with text */}
      <MSANotificationBadge
        variant="button"
        onClick={() => setLocation('/msa-approvals')}
      />
    </nav>
  );
}
```

## Hooks

### useMSAsAwaitingApproval

Fetches all MSAs awaiting approval for the current user.

```tsx
import { useMSAsAwaitingApproval } from '@/hooks/useMSAApproval';

function MyComponent() {
  const { data: msas, isLoading, error, refetch } = useMSAsAwaitingApproval();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {msas?.map(msa => (
        <div key={msa.id}>{msa.name}</div>
      ))}
    </div>
  );
}
```

**Query Key:** `['msa', 'awaiting-approval']`
**Refetch Interval:** 5 minutes
**Stale Time:** 2 minutes

### useMSA

Fetches a specific MSA by ID.

```tsx
import { useMSA } from '@/hooks/useMSAApproval';

function MSADetails({ msaId }: { msaId: string }) {
  const { data: msa, isLoading, error } = useMSA(msaId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!msa) return <div>MSA not found</div>;

  return <div>{msa.name}</div>;
}
```

**Query Key:** `['msa', msaId]`
**Enabled:** Only when `msaId` is provided

### useHasPendingMSAs

Quick check if there are pending MSAs (useful for badges).

```tsx
import { useHasPendingMSAs } from '@/hooks/useMSAApproval';

function NotificationBell() {
  const { hasPending, count, isLoading } = useHasPendingMSAs();

  return (
    <button>
      Notifications
      {hasPending && <Badge>{count}</Badge>}
    </button>
  );
}
```

## Types

All TypeScript types are defined in `/client/src/types/msa.ts`:

```typescript
// Main MSA document type
export interface MSADocument {
  id: string;
  msaNumber: string;
  name: string;
  status: MSAStatus;
  companyApprovedAt?: string;
  bureauApprovedAt?: string;
  // ... see file for complete type
}

// MSA status enum
export type MSAStatus =
  | 'draft'
  | 'pending_approval'
  | 'active'
  | 'expired'
  | 'terminated';

// Request/Response types
export interface MSAApprovalRequest { ... }
export interface MSARejectionRequest { ... }
export interface MSAApprovalResponse { ... }
export interface MSAListResponse { ... }
```

## API Endpoints

The component integrates with these Phase 2 MSA API endpoints:

- **GET** `/api/msa/awaiting-approval` - Get MSAs awaiting user's approval
- **GET** `/api/msa/:id` - Get specific MSA details
- **POST** `/api/msa/approve/:id` - Approve an MSA
- **POST** `/api/msa/reject/:id` - Reject an MSA (requires `reason` in body)

## Example Pages

### Dedicated MSA Approvals Page

See `/client/src/pages/msa-approvals.tsx` for a complete example showing:
- Loading states with skeletons
- Error handling
- Empty state when no approvals
- Grid layout of pending MSAs
- Click to open approval modal

### Integration into Existing Pages

```tsx
// In your bureau portal or company dashboard
import { MSANotificationBadge } from '@/components/msa/MSANotificationBadge';
import { MSAApprovalModal } from '@/components/msa/MSAApprovalModal';
import { useMSAsAwaitingApproval } from '@/hooks/useMSAApproval';

function Dashboard() {
  const { data: pendingMSAs } = useMSAsAwaitingApproval();
  const [selectedMSA, setSelectedMSA] = useState(null);

  return (
    <div>
      {/* Notification in header */}
      <MSANotificationBadge onClick={() => navigate('/msa-approvals')} />

      {/* Or inline list */}
      {pendingMSAs?.map(msa => (
        <div onClick={() => setSelectedMSA(msa)}>
          {msa.name} - Pending Approval
        </div>
      ))}

      {/* Modal */}
      <MSAApprovalModal
        msa={selectedMSA}
        isOpen={!!selectedMSA}
        onClose={() => setSelectedMSA(null)}
        userType={user.userType}
      />
    </div>
  );
}
```

## Testing

Comprehensive test suite in `/client/src/components/msa/__tests__/MSAApprovalModal.test.tsx`

**Run tests:**

```bash
npm test -- MSAApprovalModal
```

**Coverage areas:**
- Rendering MSA details correctly
- Approval workflow with confirmation
- Rejection workflow with required reason
- Loading states
- Error handling
- Close behavior and cleanup
- onSuccess callbacks

**Test data:**
- Mock MSA with all fields populated
- Mock MSA with approvals completed
- API success/error scenarios

## Styling

Uses shadcn/ui components with Tailwind CSS:
- Responsive grid layouts (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Mobile-friendly cards and modals
- Color-coded badges (green for approved, amber for pending, red for rejected)
- Loading animations (pulse, ping effects)
- Smooth transitions and hover states

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management in modals
- Color contrast WCAG AA compliant

## Best Practices

1. **Always provide onClose callback** - Required for proper modal cleanup
2. **Handle onSuccess for refetching** - Invalidate queries after approval/rejection
3. **Check userType for permissions** - Only show approve button if user can approve
4. **Validate rejection reason** - Required field, minimum length check
5. **Use React Query invalidation** - Keep data fresh after mutations
6. **Loading states everywhere** - Disable buttons during API calls
7. **Error handling** - Always show user-friendly error messages

## File Structure

```
client/src/
├── components/msa/
│   ├── MSAApprovalModal.tsx       # Main approval modal
│   ├── MSANotificationBadge.tsx   # Notification badge
│   ├── README.md                  # This file
│   └── __tests__/
│       └── MSAApprovalModal.test.tsx
├── hooks/
│   └── useMSAApproval.ts          # React Query hooks
├── types/
│   └── msa.ts                     # TypeScript types
└── pages/
    └── msa-approvals.tsx          # Example page
```

## Next Steps

1. **Add to navigation** - Include link to `/msa-approvals` in main menu
2. **Notification integration** - Add `MSANotificationBadge` to header
3. **Email notifications** - Backend sends email when MSA needs approval
4. **PDF viewer** - Add modal to view MSA document before approving
5. **Audit log** - Track all approval/rejection actions
6. **Bulk actions** - Approve multiple MSAs at once

## Support

For issues or questions:
- Check test file for usage examples
- Review API documentation in `/docs/MSA_API_DOCUMENTATION.md`
- See Phase 2 MSA migration in `/supabase/migrations/`

---

**Version:** 1.0.0
**Last Updated:** 2025-11-08
**Author:** Frontend Specialist following CLAUDE Framework
