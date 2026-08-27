/**
 * Inspection Queue - Shop Owner Dashboard
 *
 * Displays items awaiting inspection after warehouse receipt.
 * Mobile-first design with accessible inspection actions.
 */

'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Package, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface InspectionQueueProps {
  shopId: string;
}

// Mock data - in production, this would come from API
const mockInspections = [
  {
    id: 'inspection-1',
    returnId: 'return-1',
    orderNumber: 'ORD-12345',
    productName: 'Product A',
    variantSku: 'SKU-001',
    quantity: 1,
    warehouseReceivedAt: new Date('2024-01-18'),
    status: 'pending',
  },
  {
    id: 'inspection-2',
    returnId: 'return-2',
    orderNumber: 'ORD-12346',
    productName: 'Product B',
    variantSku: 'SKU-002',
    quantity: 2,
    warehouseReceivedAt: new Date('2024-01-19'),
    status: 'pending',
  },
];

export function InspectionQueue({ shopId }: InspectionQueueProps) {
  const [inspections, setInspections] = useState(mockInspections);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [inspectionResult, setInspectionResult] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [dispositionAction, setDispositionAction] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompleteInspection = async () => {
    if (!selectedInspection || !inspectionResult || !dispositionAction) return;

    setLoading(true);
    // In production, this would call the API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setInspections(inspections.filter((i) => i.id !== selectedInspection.id));
    setSelectedInspection(null);
    setInspectionResult('');
    setConditionNotes('');
    setDispositionAction('');
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Inspection Queue</h2>
        <Badge variant="secondary">{inspections.length} pending</Badge>
      </div>

      {inspections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No items pending inspection</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inspections.map((inspection) => (
            <Card key={inspection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {inspection.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {inspection.productName} • SKU: {inspection.variantSku}
                    </p>
                  </div>
                  <Badge variant="outline">Qty: {inspection.quantity}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Received at Warehouse
                  </span>
                  <span>
                    {new Date(
                      inspection.warehouseReceivedAt,
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Inspection Result
                    </label>
                    <Select
                      value={inspectionResult}
                      onValueChange={setInspectionResult}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Condition Notes
                    </label>
                    <Textarea
                      placeholder="Describe the condition of the item..."
                      value={conditionNotes}
                      onChange={(e: any) => setConditionNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Disposition Action
                    </label>
                    <Select
                      value={dispositionAction}
                      onValueChange={setDispositionAction}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restock">
                          Restock to Inventory
                        </SelectItem>
                        <SelectItem value="refurbish">Refurbish</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="dispose">Dispose</SelectItem>
                        <SelectItem value="return_to_vendor">
                          Return to Vendor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedInspection(inspection)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Inspection
                    </Button>
                    <Button variant="outline" disabled={loading}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Skip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
