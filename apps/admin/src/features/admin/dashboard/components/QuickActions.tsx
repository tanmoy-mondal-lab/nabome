/**
 * Quick Actions Component
 * Source: ADMIN_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { Card } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Button } from '@nabome/ui';
import { Grid } from '@nabome/ui';
import type { LucideIcon } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  permission: string;
  shortcut?: string;
  url: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card padding="lg" elevated>
      <Heading level="h3" className="mb-4">
        Quick Actions
      </Heading>
      <Grid cols={1} colsSm={2} colsMd={4} gap="sm">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => {
              // Navigate to action.url
              window.location.href = action.url;
            }}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
            {action.shortcut && (
              <span className="ml-auto text-xs text-gray-400">
                {action.shortcut}
              </span>
            )}
          </Button>
        ))}
      </Grid>
    </Card>
  );
}
