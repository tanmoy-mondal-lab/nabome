/**
 * Admin Returns Dashboard
 *
 * Main dashboard for admins to manage returns globally.
 * Mobile-first design with accessible navigation.
 */

'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { GlobalReturnsDashboard } from './components/global-returns-dashboard';
import { PolicyManagement } from './components/policy-management';
import { DisputeResolution } from './components/dispute-resolution';
import { RefundMonitoring } from './components/refund-monitoring';
import { BarChart3, Settings, AlertTriangle, CreditCard } from 'lucide-react';

export default function AdminReturnsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Returns Administration</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="dashboard" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="disputes" className="flex-1">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Disputes
          </TabsTrigger>
          <TabsTrigger value="refunds" className="flex-1">
            <CreditCard className="w-4 h-4 mr-2" />
            Refunds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <GlobalReturnsDashboard />
        </TabsContent>

        <TabsContent value="policies">
          <PolicyManagement />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputeResolution />
        </TabsContent>

        <TabsContent value="refunds">
          <RefundMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}
