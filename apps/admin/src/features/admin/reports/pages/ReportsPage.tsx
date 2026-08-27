/**
 * Reports Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Revenue Reports, Commerce Reports, Customer Reports, Shop Reports, Security Reports, Audit Reports, Operations Reports
 */

import { useState } from 'react';

import { Grid } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import {
  FileText,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Shield,
  Activity,
  Download,
  Plus,
  Loader2,
} from 'lucide-react';

import {
  useGenerateRevenueReport,
  useGenerateCommerceReport,
  useGenerateCustomerReport,
  useGenerateShopReport,
  useGenerateSecurityReport,
  useGenerateAuditReport,
  useGenerateOperationsReport,
} from '../hooks/useReports';

export default function ReportsPage() {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const generateRevenueReport = useGenerateRevenueReport();
  const generateCommerceReport = useGenerateCommerceReport();
  const generateCustomerReport = useGenerateCustomerReport();
  const generateShopReport = useGenerateShopReport();
  const generateSecurityReport = useGenerateSecurityReport();
  const generateAuditReport = useGenerateAuditReport();
  const generateOperationsReport = useGenerateOperationsReport();

  const reportTypes = [
    {
      id: 'revenue',
      name: 'Revenue Reports',
      description: 'Financial performance and revenue analysis',
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      id: 'commerce',
      name: 'Commerce Reports',
      description: 'Orders, products, and marketplace metrics',
      icon: ShoppingCart,
      color: 'text-blue-500',
    },
    {
      id: 'customer',
      name: 'Customer Reports',
      description: 'Customer behavior and engagement analytics',
      icon: Users,
      color: 'text-purple-500',
    },
    {
      id: 'shop',
      name: 'Shop Reports',
      description: 'Shop performance and seller analytics',
      icon: Store,
      color: 'text-orange-500',
    },
    {
      id: 'security',
      name: 'Security Reports',
      description: 'Security incidents and access logs',
      icon: Shield,
      color: 'text-red-500',
    },
    {
      id: 'audit',
      name: 'Audit Reports',
      description: 'Compliance and governance audit trails',
      icon: FileText,
      color: 'text-gray-500',
    },
    {
      id: 'operations',
      name: 'Operations Reports',
      description: 'System performance and operational metrics',
      icon: Activity,
      color: 'text-cyan-500',
    },
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Monthly Revenue Report',
      type: 'revenue',
      format: 'pdf',
      status: 'completed',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'Admin',
    },
    {
      id: '2',
      name: 'Weekly Commerce Summary',
      type: 'commerce',
      format: 'csv',
      status: 'completed',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'Admin',
    },
    {
      id: '3',
      name: 'Security Audit Log',
      type: 'security',
      format: 'json',
      status: 'generating',
      generatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      generatedBy: 'System',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'generating':
        return <Badge variant="info">Generating</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleGenerateReport = async (type: string) => {
    setGeneratingReport(type);
    try {
      switch (type) {
        case 'revenue':
          await generateRevenueReport.mutateAsync({ period: 'last-30-days' });
          break;
        case 'commerce':
          await generateCommerceReport.mutateAsync({ period: 'last-30-days' });
          break;
        case 'customer':
          await generateCustomerReport.mutateAsync({ segment: 'all' });
          break;
        case 'shop':
          await generateShopReport.mutateAsync({ status: 'active' });
          break;
        case 'security':
          await generateSecurityReport.mutateAsync({ type: 'all' });
          break;
        case 'audit':
          await generateAuditReport.mutateAsync({});
          break;
        case 'operations':
          await generateOperationsReport.mutateAsync({});
          break;
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    // This would call the reportsApi.downloadReport function
    console.log(`Downloading report ${reportId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Reports</Heading>
          <Text size="sm" className="text-gray-600">
            Generate and download platform reports
          </Text>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Report Types */}
      <Grid cols={1} colsSm={2} colsMd={3} gap="md">
        {reportTypes.map((type) => (
          <Card
            key={type.id}
            padding="lg"
            elevated
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              generatingReport === type.id
                ? 'opacity-50 pointer-events-none'
                : ''
            }`}
            onClick={() => handleGenerateReport(type.id)}
          >
            <Stack gap="md">
              <div
                className={`h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center`}
              >
                {generatingReport === type.id ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <type.icon className={`h-6 w-6 ${type.color}`} />
                )}
              </div>
              <div>
                <Heading level="h3">{type.name}</Heading>
                <Text size="sm" className="text-gray-600">
                  {type.description}
                </Text>
              </div>
            </Stack>
          </Card>
        ))}
      </Grid>

      {/* Recent Reports */}
      <Card padding="lg" elevated>
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">Recent Reports</Heading>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Report Name
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Type
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Format
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Generated By
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Generated At
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id} className="border-b border-gray-100">
                  <td className="py-3">
                    <Text size="sm" weight="medium">
                      {report.name}
                    </Text>
                  </td>
                  <td className="py-3">
                    <Text size="sm" className="capitalize">
                      {report.type}
                    </Text>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline">
                      {report.format.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3">{getStatusBadge(report.status)}</td>
                  <td className="py-3">
                    <Text size="sm">{report.generatedBy}</Text>
                  </td>
                  <td className="py-3">
                    <Text size="sm" className="text-gray-500">
                      {new Date(report.generatedAt).toLocaleString()}
                    </Text>
                  </td>
                  <td className="py-3">
                    {report.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report Generation Guide */}
      <Card padding="lg" elevated>
        <Heading level="h3" className="mb-4">
          Report Generation Guide
        </Heading>
        <Stack gap="sm">
          <Text size="sm" className="text-gray-600">
            • Select a report type from the cards above to generate a new report
          </Text>
          <Text size="sm" className="text-gray-600">
            • Reports can be generated in PDF, CSV, or JSON format
          </Text>
          <Text size="sm" className="text-gray-600">
            • Large reports may take several minutes to generate
          </Text>
          <Text size="sm" className="text-gray-600">
            • Reports are automatically archived after 30 days
          </Text>
        </Stack>
      </Card>
    </div>
  );
}
