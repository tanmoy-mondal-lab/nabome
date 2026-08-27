/**
 * Security Operations Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Audit Logs, Active Sessions, RBAC Management, Permission Matrix, Failed Login Monitoring, Security Alerts
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
  Shield,
  Activity,
  Users,
  AlertTriangle,
  FileText,
  Settings,
  RefreshCw,
} from 'lucide-react';

import { useSecurityAuditLogs } from '@/features/admin/hooks/use-security-operations';
import { useSecurityAlerts } from '@/features/admin/hooks/use-security-operations';
import { useAdminPermissions } from '@/features/admin/hooks/use-admin-permissions';
import { setDocumentMeta } from '@/lib/seo';

export default function SecurityPage() {
  const { data: auditLogs, isLoading: auditLogsLoading } =
    useSecurityAuditLogs();
  const { data: alerts, isLoading: alertsLoading } = useSecurityAlerts();
  const { hasPermission } = useAdminPermissions();

  useEffect(() => {
    setDocumentMeta({ title: 'Security Operations — নবME Admin' });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Security Operations</Heading>
          <Text size="sm" className="text-gray-600">
            Monitor security events, audit logs, and access control
          </Text>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Security Overview */}
      <Grid cols={1} colsMd={4} gap="md">
        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Shield className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Active Sessions
            </Text>
            <Text size="lg" weight="medium">
              {auditLogsLoading ? '...' : '24'}
            </Text>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Activity className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Audit Events (24h)
            </Text>
            <Text size="lg" weight="medium">
              {auditLogsLoading ? '...' : '1,234'}
            </Text>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <Text size="sm" className="text-gray-600">
              Security Alerts
            </Text>
            <Text size="lg" weight="medium">
              {alertsLoading ? '...' : alerts?.length || 0}
            </Text>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Users className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Failed Logins (24h)
            </Text>
            <Text size="lg" weight="medium">
              {auditLogsLoading ? '...' : '12'}
            </Text>
          </Stack>
        </Card>
      </Grid>

      {/* Security Sections */}
      <Grid cols={1} colsMd={2} gap="md">
        {/* Security Alerts */}
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Security Alerts</Heading>
            <Badge
              variant={alerts && alerts.length > 0 ? 'warning' : 'success'}
            >
              {alerts && alerts.length > 0
                ? `${alerts.length} Active`
                : 'No Alerts'}
            </Badge>
          </div>
          {alertsLoading ? (
            <Text size="sm" className="text-gray-500">
              Loading alerts...
            </Text>
          ) : alerts && alerts.length > 0 ? (
            <Stack gap="sm">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 border-b border-gray-100 pb-3 last:border-0"
                >
                  <AlertTriangle
                    className={`mt-1 h-4 w-4 ${
                      alert.severity === 'critical'
                        ? 'text-red-500'
                        : alert.severity === 'high'
                          ? 'text-orange-500'
                          : alert.severity === 'medium'
                            ? 'text-yellow-500'
                            : 'text-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <Text size="sm" weight="medium">
                      {alert.type}
                    </Text>
                    <Text size="xs" className="text-gray-500">
                      {alert.description}
                    </Text>
                    <Text size="xs" className="text-gray-400">
                      {new Date(alert.createdAt).toLocaleString()}
                    </Text>
                  </div>
                  {hasPermission('security:alert:resolve') && (
                    <Button variant="ghost" size="sm">
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              No active security alerts
            </Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Quick Actions
          </Heading>
          <Stack gap="sm">
            {hasPermission('security:session:manage') && (
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Active Sessions
              </Button>
            )}
            {hasPermission('security:audit:read') && (
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                View Audit Logs
              </Button>
            )}
            {hasPermission('security:rbac:manage') && (
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                RBAC Management
              </Button>
            )}
          </Stack>
        </Card>
      </Grid>

      {/* Recent Audit Logs */}
      <Card padding="lg" elevated>
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">Recent Audit Logs</Heading>
          {hasPermission('security:audit:read') && (
            <Button variant="ghost" size="sm">
              View All
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Action
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  User
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Resource
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  IP
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogsLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading audit logs...
                  </td>
                </tr>
              ) : auditLogs && auditLogs.length > 0 ? (
                auditLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <Text size="sm">{log.action}</Text>
                    </td>
                    <td className="py-3">
                      <Text size="sm">{log.userId || 'System'}</Text>
                    </td>
                    <td className="py-3">
                      <Text size="sm">{log.resource}</Text>
                    </td>
                    <td className="py-3">
                      <Text size="sm" className="text-gray-500">
                        {log.ip || '-'}
                      </Text>
                    </td>
                    <td className="py-3">
                      <Badge variant={log.success ? 'success' : 'error'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Text size="sm" className="text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </Text>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No audit logs found
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
