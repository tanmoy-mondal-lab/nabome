/**
 * Pending Tasks Component
 * Source: ADMIN_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { Card } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import { Clock, ArrowRight } from 'lucide-react';

export interface PendingTask {
  id: string;
  type: string;
  description: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

interface PendingTasksProps {
  tasks: PendingTask[];
  loading?: boolean;
}

export function PendingTasks({ tasks, loading }: PendingTasksProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge>Low</Badge>;
      default:
        return <Badge>Low</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-yellow-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-blue-500';
    }
  };

  if (loading) {
    return (
      <Card padding="lg" elevated>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card padding="lg" elevated>
        <Heading level="h3" className="mb-4">
          Pending Tasks
        </Heading>
        <Text size="sm" className="text-gray-500">
          No pending tasks
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="lg" elevated>
      <Heading level="h3" className="mb-4">
        Pending Tasks
      </Heading>
      <Stack gap="md">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
              <Text size="sm">{task.description}</Text>
              {task.count > 0 && <Badge variant="outline">{task.count}</Badge>}
            </div>
            <div className="flex items-center space-x-2">
              {getPriorityBadge(task.priority)}
              {task.actionUrl && (
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </Stack>
    </Card>
  );
}
