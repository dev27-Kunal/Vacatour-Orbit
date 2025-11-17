/**
 * Individual job card component
 * Extracted from my-jobs.tsx to follow CLAUDE C-4 (functions ≤20 lines)
 */

import { Edit, Trash2, Eye, Play, Pause, X, MapPin, Euro, Calendar, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  getEmploymentTypeLabel, 
  getEmploymentTypeBadgeVariant,
  getStatusLabel,
  getStatusVariant,
  formatSalary,
  formatDate
} from "@/lib/job-utils";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: "VAST" | "INTERIM" | "UITZENDEN";
  hourlyRate: number | null;
  salary: number | null;
  startDate: string | null;
  endDate: string | null;
  status: "OPEN" | "PAUSED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

interface JobCardProps {
  job: Job;
  onStatusChange: (jobId: string, newStatus: string) => void;
  onDeleteJob: (jobId: string) => void;
  userType?: string;
  distributionId?: string;
}

/**
 * Render job action buttons
 */
function JobActions({ job, onStatusChange, onDeleteJob, userType, distributionId }: JobCardProps) {
  // For BUREAU users, show different actions
  if (userType === 'BUREAU') {
    return (
      <div className="flex gap-2">
        <Link to={`/jobs/${job.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Bekijken
          </Button>
        </Link>

        <Link to={`/bureau-portal/submit-candidate?jobId=${job.id}${distributionId ? `&distributionId=${distributionId}` : ''}`}>
          <Button variant="default" size="sm">
            <UserPlus className="h-4 w-4 mr-1" />
            Kandidaat Aanbieden
          </Button>
        </Link>
      </div>
    );
  }

  // For BEDRIJF users, show regular actions
  return (
    <div className="flex gap-2">
      <Link to={`/jobs/${job.id}`}>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Bekijken
        </Button>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Acties
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link to={`/jobs/${job.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Bewerken
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {job.status === "OPEN" ? (
            <DropdownMenuItem onClick={() => onStatusChange(job.id, "PAUSED")}>
              <Pause className="h-4 w-4 mr-2" />
              Pauzeren
            </DropdownMenuItem>
          ) : job.status === "PAUSED" ? (
            <DropdownMenuItem onClick={() => onStatusChange(job.id, "OPEN")}>
              <Play className="h-4 w-4 mr-2" />
              Activeren
            </DropdownMenuItem>
          ) : null}

          {job.status !== "CLOSED" && (
            <DropdownMenuItem onClick={() => onStatusChange(job.id, "CLOSED")}>
              <X className="h-4 w-4 mr-2" />
              Sluiten
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash2 className="h-4 w-4 mr-2" />
                Verwijderen
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Vacature verwijderen</AlertDialogTitle>
                <AlertDialogDescription>
                  Weet je zeker dat je deze vacature wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteJob(job.id)}>
                  Verwijderen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Render job details section
 */
function JobDetails({ job }: { job: Job }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        {job.location}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Euro className="h-4 w-4" />
        {formatSalary(job.salary, job.hourlyRate)}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        Geplaatst: {formatDate(job.createdAt)}
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Badge variant={getEmploymentTypeBadgeVariant(job.employmentType)}>
          {getEmploymentTypeLabel(job.employmentType)}
        </Badge>
        <Badge variant={getStatusVariant(job.status)}>
          {getStatusLabel(job.status)}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Individual job card component
 */
export function JobCard({ job, onStatusChange, onDeleteJob, userType, distributionId }: JobCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {job.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <JobDetails job={job} />
        <div className="mt-4 pt-4 border-t">
          <JobActions
            job={job}
            onStatusChange={onStatusChange}
            onDeleteJob={onDeleteJob}
            userType={userType}
            distributionId={distributionId}
          />
        </div>
      </CardContent>
    </Card>
  );
}