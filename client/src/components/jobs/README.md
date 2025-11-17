# Job Distribution Components

Components for managing job distribution to bureaus in the Company Portal.

## Overview

This module provides a complete UI for company users to:
- Distribute jobs to matching bureaus automatically
- View which bureaus have access to a job
- Monitor submissions and acceptances per bureau
- Remove bureaus from a job distribution
- Track distribution status in real-time

## Components

### 1. JobDistributionManager

**Location:** `client/src/components/jobs/JobDistributionManager.tsx`

Main component that orchestrates job distribution. Provides:
- Distribution button (auto-distributes to all matching bureaus)
- Statistics cards (total bureaus, active, submissions, accepted)
- Real-time updates (polls every 30 seconds)
- Bureau list management

**Usage:**
```tsx
import { JobDistributionManager } from '@/components/jobs';

function JobPage() {
  return <JobDistributionManager jobId="uuid" />;
}
```

**Props:**
- `jobId: string` - The job ID to manage distributions for

**Features:**
- Auto-refresh toggle
- Statistics dashboard
- Success/error notifications
- Loading and error states

---

### 2. DistributedBureausList

**Location:** `client/src/components/jobs/DistributedBureausList.tsx`

Table component showing all bureaus a job is distributed to.

**Features:**
- Filter by distribution status (PENDING, ACTIVE, PAUSED, COMPLETED, CANCELLED)
- Sort by: name, status, submissions, accepted
- Remove distribution action
- Confirmation dialog for destructive actions
- Empty state when no distributions
- Responsive design

**Usage:**
```tsx
import { DistributedBureausList } from '@/components/jobs';

function DistributionsView() {
  const distributions = useDistributions(jobId);

  return (
    <DistributedBureausList
      jobId={jobId}
      distributions={distributions}
      onRemove={handleRemove}
      onRefresh={handleRefresh}
      isLoading={false}
    />
  );
}
```

**Props:**
- `jobId: string` - Job ID
- `distributions: DistributionWithBureau[]` - Array of distributions
- `onRemove: (bureauId: string) => Promise<void>` - Remove handler
- `onRefresh: () => void` - Refresh handler
- `isLoading?: boolean` - Loading state

---

### 3. DistributionStatusBadge

**Location:** `client/src/components/jobs/DistributionStatusBadge.tsx`

Simple badge component for distribution status.

**Statuses:**
- `PENDING` - In behandeling (yellow)
- `ACTIVE` - Actief (green)
- `PAUSED` - Gepauzeerd (gray)
- `COMPLETED` - Voltooid (blue)
- `CANCELLED` - Geannuleerd (red)

**Usage:**
```tsx
import { DistributionStatusBadge } from '@/components/jobs';

<DistributionStatusBadge status="ACTIVE" />
```

**Props:**
- `status: DistributionStatus` - The status to display
- `className?: string` - Additional CSS classes

---

## API Client

### jobDistributionApi

**Location:** `client/src/lib/api/job-distributions.ts`

Centralized API client for job distribution endpoints.

**Methods:**

#### distributeJob(jobId: string)
Distributes job to all matching bureaus automatically.

```tsx
const result = await jobDistributionApi.distributeJob(jobId);
// Returns: { success, message, distributedCount, distributions }
```

#### getDistributions(jobId: string, filters?: DistributionFilters)
Gets all distributions for a job with optional filtering.

```tsx
const distributions = await jobDistributionApi.getDistributions(jobId, {
  status: 'ACTIVE',
  sortBy: 'submissions',
  sortOrder: 'desc'
});
```

#### removeDistribution(jobId: string, bureauId: string)
Removes a bureau from job distribution.

```tsx
await jobDistributionApi.removeDistribution(jobId, bureauId);
```

#### updateDistribution(jobId: string, bureauId: string, data)
Updates distribution status or notes.

```tsx
await jobDistributionApi.updateDistribution(jobId, bureauId, {
  status: 'PAUSED',
  notes: 'Temporarily paused'
});
```

#### getDistributionStats(jobId: string)
Gets aggregated statistics for a job's distributions.

```tsx
const stats = await jobDistributionApi.getDistributionStats(jobId);
// Returns: { totalDistributed, byStatus, byTier, totalSubmissions, totalAccepted }
```

---

## Page Integration

### Company Job Detail Page

**Location:** `client/src/pages/company/jobs/[id].tsx`

Full job detail page with tabs for:
1. **Details** - Job description, requirements, benefits
2. **Distribution** - Bureau distribution management (uses JobDistributionManager)
3. **Applications** - Candidate submissions (placeholder)
4. **Analytics** - Performance metrics (placeholder)

**Route:** `/company/jobs/:id`

**Access:** Company users only

**Usage:**
Add to your router configuration:

```tsx
// Using Wouter
import CompanyJobDetail from '@/pages/company/jobs/[id]';

<Route path="/company/jobs/:id" component={CompanyJobDetail} />
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   JobDistributionManager                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. Fetch distributions (React Query)                  │  │
│  │ 2. Display statistics                                 │  │
│  │ 3. Auto-refresh every 30s                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           DistributedBureausList                       │  │
│  │  - Filter by status                                   │  │
│  │  - Sort by various fields                             │  │
│  │  - Remove distributions                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │   jobDistributionApi          │
            │  (API Client)                 │
            └───────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │  Backend API Endpoints        │
            │  POST   /api/v2/jobs/:id/distribute           │
            │  GET    /api/v2/jobs/:id/distributions        │
            │  DELETE /api/v2/jobs/:id/distributions/:bid   │
            │  PATCH  /api/v2/jobs/:id/distributions/:bid   │
            └───────────────────────────────┘
```

---

## TypeScript Types

All types are imported from `@shared/types/vms`:

```typescript
import {
  DistributedJob,
  DistributionStatus,
  DistributionTier,
} from '@shared/types/vms';

// Extended type with bureau details
interface DistributionWithBureau extends DistributedJob {
  bureau: {
    id: string;
    name: string;
    performanceTier: string;
    email: string;
  };
}
```

---

## Error Handling

All components include comprehensive error handling:

1. **API Errors**: Caught and displayed via toast notifications
2. **Loading States**: Skeleton loaders during data fetch
3. **Empty States**: Helpful messages when no data
4. **Validation**: Client-side validation before API calls
5. **Confirmation Dialogs**: For destructive actions

---

## Accessibility

Components follow WCAG 2.1 AA standards:

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly

---

## Mobile Responsive

All components are fully responsive:

- Flexbox/Grid layouts adapt to screen size
- Touch-friendly button sizes
- Collapsible tables on mobile
- Readable text sizes
- Proper spacing

---

## Future Enhancements

Planned features:
- [ ] Bulk distribution actions
- [ ] Distribution templates
- [ ] Performance insights per bureau
- [ ] Email notifications on status changes
- [ ] Distribution scheduling
- [ ] Bureau feedback system

---

## Testing

To test the components:

1. **Unit Tests**: Component behavior and state management
2. **Integration Tests**: API interactions with mock server
3. **E2E Tests**: Full user flow with Playwright

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

---

## Support

For questions or issues:
- Check existing backend API documentation
- Review VMS types in `shared/types/vms.ts`
- Consult CLAUDE.md for development standards
