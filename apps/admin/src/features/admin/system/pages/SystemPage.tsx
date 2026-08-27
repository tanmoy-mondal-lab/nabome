/**
 * System Operations Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Background Jobs, Queue Monitoring, Cache Status, Search Index Status, Storage Health, Database Health, API Health, Scheduled Tasks
 */

import { useEffect } from 'react';

import { Grid } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import {
  Server,
  Database,
  HardDrive,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';

import { useBackgroundJobs } from '@/features/admin/hooks/use-system-operations';
import { useQueueStatus } from '@/features/admin/hooks/use-system-operations';
import { useCacheStatus } from '@/features/admin/hooks/use-system-operations';
import { useSearchIndexStatus } from '@/features/admin/hooks/use-system-operations';
import { useStorageHealth } from '@/features/admin/hooks/use-system-operations';
import { useDatabaseHealth } from '@/features/admin/hooks/use-system-operations';
import { useAPIHealth } from '@/features/admin/hooks/use-system-operations';
import { useScheduledTasks } from '@/features/admin/hooks/use-system-operations';
import { setDocumentMeta } from '@/lib/seo';

export default function SystemPage() {
  const { data: jobs } = useBackgroundJobs();
  const { data: queues } = useQueueStatus();
  const { data: caches } = useCacheStatus();
  const { data: searchIndexes } = useSearchIndexStatus();
  const { data: storage } = useStorageHealth();
  const { data: database } = useDatabaseHealth();
  const { data: apis } = useAPIHealth();
  const { data: tasks } = useScheduledTasks();

  useEffect(() => {
    setDocumentMeta({ title: 'System Operations — নবME Admin' });
  }, []);

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="warning">Degraded</Badge>;
      case 'down':
        return <Badge variant="error">Down</Badge>;
      case 'rebuilding':
        return <Badge variant="info">Rebuilding</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">System Operations</Heading>
          <Text size="sm" className="text-gray-600">
            Monitor system health, jobs, queues, and infrastructure
          </Text>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <Grid cols={1} colsMd={4} gap="md">
        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Server className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Database
            </Text>
            {database ? (
              getHealthBadge(database.status)
            ) : (
              <Badge>Unknown</Badge>
            )}
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Database className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              API Health
            </Text>
            <Badge variant="success">99.9%</Badge>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <HardDrive className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Storage
            </Text>
            {storage && storage.length > 0 ? (
              getHealthBadge(storage[0]!.status)
            ) : (
              <Badge>Unknown</Badge>
            )}
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Activity className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Background Jobs
            </Text>
            <Text size="lg" weight="medium">
              {jobs?.length || 0}
            </Text>
          </Stack>
        </Card>
      </Grid>

      {/* System Components */}
      <Grid cols={1} colsMd={2} gap="md">
        {/* Database Health */}
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Database Health</Heading>
            {database ? (
              getHealthBadge(database.status)
            ) : (
              <Badge>Unknown</Badge>
            )}
          </div>
          {database ? (
            <Stack gap="sm">
              <div className="flex items-center justify-between text-sm">
                <Text className="text-gray-600">Connection Pool</Text>
                <Text weight="medium">
                  {database.connectionPool.active}/
                  {database.connectionPool.total}
                </Text>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Text className="text-gray-600">Latency</Text>
                <Text weight="medium">{database.latency}ms</Text>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Text className="text-gray-600">Last Check</Text>
                <Text size="xs" className="text-gray-500">
                  {new Date(database.lastHealthCheck).toLocaleString()}
                </Text>
              </div>
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              Loading database health...
            </Text>
          )}
        </Card>

        {/* Storage Health */}
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Storage Health</Heading>
            {storage && storage.length > 0 ? (
              getHealthBadge(storage[0]!.status)
            ) : (
              <Badge>Unknown</Badge>
            )}
          </div>
          {storage && storage.length > 0 ? (
            <Stack gap="sm">
              {storage.map((s) => (
                <div key={s.provider} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">
                      {s.provider.toUpperCase()}
                    </Text>
                    {getHealthBadge(s.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Used</Text>
                    <Text weight="medium">
                      {((s.totalUsed / s.totalCapacity) * 100).toFixed(1)}%
                    </Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Last Check</Text>
                    <Text size="xs" className="text-gray-500">
                      {new Date(s.lastHealthCheck).toLocaleString()}
                    </Text>
                  </div>
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              Loading storage health...
            </Text>
          )}
        </Card>

        {/* Queue Status */}
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Queue Status</Heading>
            <Badge variant="success">Running</Badge>
          </div>
          {queues && queues.length > 0 ? (
            <Stack gap="sm">
              {queues.map((queue) => (
                <div key={queue.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">{queue.name}</Text>
                    <Text weight="medium">{queue.size} pending</Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Processing</Text>
                    <Text weight="medium">{queue.processing}</Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Failed</Text>
                    <Text weight="medium">{queue.failed}</Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Avg Time</Text>
                    <Text weight="medium">{queue.avgProcessingTime}ms</Text>
                  </div>
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              Loading queue status...
            </Text>
          )}
        </Card>

        {/* Cache Status */}
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Cache Status</Heading>
            <Badge variant="success">Active</Badge>
          </div>
          {caches && caches.length > 0 ? (
            <Stack gap="sm">
              {caches.map((cache) => (
                <div key={cache.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">{cache.name}</Text>
                    <Text weight="medium">
                      {cache.hitRate.toFixed(1)}% hit rate
                    </Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Size</Text>
                    <Text weight="medium">{cache.size} items</Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Evictions</Text>
                    <Text weight="medium">{cache.evictionCount}</Text>
                  </div>
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              Loading cache status...
            </Text>
          )}
        </Card>

        {/* Search Index Status */}
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Search Index Status</Heading>
            <Badge variant="success">Healthy</Badge>
          </div>
          {searchIndexes && searchIndexes.length > 0 ? (
            <Stack gap="sm">
              {searchIndexes.map((index) => (
                <div key={index.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">{index.name}</Text>
                    {getHealthBadge(index.health)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Documents</Text>
                    <Text weight="medium">{index.documentCount}</Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Last Indexed</Text>
                    <Text size="xs" className="text-gray-500">
                      {new Date(index.lastIndexed).toLocaleString()}
                    </Text>
                  </div>
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              Loading search index status...
            </Text>
          )}
        </Card>

        {/* API Health */}
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">API Health</Heading>
            <Badge variant="success">Healthy</Badge>
          </div>
          {apis && apis.length > 0 ? (
            <Stack gap="sm">
              {apis.map((api) => (
                <div key={api.endpoint} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">{api.endpoint}</Text>
                    {getHealthBadge(api.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Response Time</Text>
                    <Text weight="medium">{api.avgResponseTime}ms</Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Error Rate</Text>
                    <Text weight="medium">{api.errorRate.toFixed(2)}%</Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text className="text-gray-600">Uptime</Text>
                    <Text weight="medium">{api.uptime.toFixed(2)}%</Text>
                  </div>
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              Loading API health...
            </Text>
          )}
        </Card>
      </Grid>

      {/* Background Jobs */}
      <Card padding="lg" elevated>
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">Background Jobs</Heading>
          <Badge variant="info">{jobs?.length || 0} Jobs</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Job
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Type
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Progress
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Started
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <Text size="sm" weight="medium">
                        {job.name}
                      </Text>
                    </td>
                    <td className="py-3">
                      <Text size="sm">{job.type}</Text>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          job.status === 'completed'
                            ? 'success'
                            : job.status === 'running'
                              ? 'info'
                              : job.status === 'failed'
                                ? 'error'
                                : 'warning'
                        }
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Text size="sm">
                        {job.progress !== undefined ? `${job.progress}%` : '-'}
                      </Text>
                    </td>
                    <td className="py-3">
                      <Text size="sm" className="text-gray-500">
                        {job.startedAt
                          ? new Date(job.startedAt).toLocaleString()
                          : '-'}
                      </Text>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No background jobs running
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Scheduled Tasks */}
      <Card padding="lg" elevated>
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">Scheduled Tasks</Heading>
          <Badge variant="info">{tasks?.length || 0} Tasks</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Task
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Schedule
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Last Run
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Next Run
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <Text size="sm" weight="medium">
                        {task.name}
                      </Text>
                    </td>
                    <td className="py-3">
                      <Text size="sm" className="text-gray-500">
                        {task.schedule}
                      </Text>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          task.status === 'active'
                            ? 'success'
                            : task.status === 'paused'
                              ? 'warning'
                              : 'error'
                        }
                      >
                        {task.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Text size="sm" className="text-gray-500">
                        {task.lastRun
                          ? new Date(task.lastRun).toLocaleString()
                          : '-'}
                      </Text>
                    </td>
                    <td className="py-3">
                      <Text size="sm" className="text-gray-500">
                        {new Date(task.nextRun).toLocaleString()}
                      </Text>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm">
                        <Zap className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No scheduled tasks
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
