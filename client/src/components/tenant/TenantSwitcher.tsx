import { useState } from 'react';
import { Check, ChevronDown, Plus, Building2, Users } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TenantSwitcherProps {
  className?: string;
  onCreateNew?: () => void;
}

export function TenantSwitcher({ className, onCreateNew }: TenantSwitcherProps) {
  const {
    currentTenant,
    currentMembership,
    userTenants,
    isLoading,
    isSwitching,
    switchTenant
  } = useTenant();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchTenant = async (tenantId: string) => {
    if (tenantId === currentTenant?.id) {
      setIsOpen(false);
      return;
    }

    const success = await switchTenant(tenantId);
    if (success) {
      setIsOpen(false);
    }
  };

  const getTenantInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'ADMIN':
        return 'secondary';
      case 'MANAGER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <Button
        variant="outline"
        onClick={onCreateNew}
        className={cn('justify-start', className)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Organization
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start px-2 py-2 h-auto',
            className
          )}
          disabled={isSwitching}
        >
          <div className="flex items-center space-x-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={currentTenant.logo_url} 
                alt={currentTenant.name}
              />
              <AvatarFallback className="text-sm font-medium">
                {getTenantInitials(currentTenant.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col items-start min-w-0 flex-1">
              <div className="flex items-center space-x-2 w-full">
                <span className="text-sm font-medium truncate">
                  {currentTenant.name}
                </span>
                {currentMembership && (
                  <Badge 
                    variant={getRoleBadgeVariant(currentMembership.role)}
                    className="text-xs px-1.5 py-0.5"
                  >
                    {currentMembership.role}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate w-full text-left">
                {userTenants.length === 1 
                  ? '1 organization' 
                  : `${userTenants.length} organizations`
                }
              </span>
            </div>
            
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="flex items-center">
          <Building2 className="mr-2 h-4 w-4" />
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-64 overflow-y-auto">
          {userTenants.map((tenant) => {
            const isCurrentTenant = tenant.id === currentTenant?.id;
            const membership = currentMembership; // You might want to fetch all memberships
            
            return (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleSwitchTenant(tenant.id)}
                className="flex items-center space-x-3 p-3 cursor-pointer"
                disabled={isSwitching}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage 
                    src={tenant.logo_url} 
                    alt={tenant.name}
                  />
                  <AvatarFallback className="text-xs">
                    {getTenantInitials(tenant.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-start min-w-0 flex-1">
                  <div className="flex items-center space-x-2 w-full">
                    <span className="text-sm font-medium truncate">
                      {tenant.name}
                    </span>
                    {isCurrentTenant && (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  {tenant.description && (
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {tenant.description}
                    </span>
                  )}
                </div>

                {membership && isCurrentTenant && (
                  <Badge 
                    variant={getRoleBadgeVariant(membership.role)}
                    className="text-xs px-1.5 py-0.5"
                  >
                    {membership.role}
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={onCreateNew}
          className="flex items-center space-x-3 p-3 cursor-pointer"
        >
          <div className="flex items-center justify-center h-6 w-6 rounded border-2 border-dashed border-muted-foreground">
            <Plus className="h-3 w-3" />
          </div>
          <span className="text-sm">Create new organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}