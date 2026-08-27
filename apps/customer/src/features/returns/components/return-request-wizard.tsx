/**
 * Return Request Wizard - Mobile-First Customer UI
 *
 * A step-by-step wizard for customers to request returns.
 * Mobile-first design with accessible forms and clear progress indication.
 */

'use client';

import { Upload } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

interface ReturnRequestWizardProps {
  orderId: string;
  orderItems: Array<{
    id: string;
    variantId: string;
    productId: string;
    productName: string;
    variantSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  onSuccess?: (returnRequest: any) => void;
  onCancel?: () => void;
}

type WizardStep =
  | 'select-items'
  | 'select-reason'
  | 'select-refund'
  | 'upload-evidence'
  | 'review'
  | 'submitting'
  | 'success';

export function ReturnRequestWizard({
  orderId,
  orderItems,
  onSuccess,
  onCancel,
}: ReturnRequestWizardProps) {
  const [step, setStep] = useState<WizardStep>('select-items');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [returnReason, setReturnReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [refundMethod, setRefundMethod] = useState('original_payment');
  const [customerNotes, setCustomerNotes] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const steps = [
    'Select Items',
    'Select Reason',
    'Refund Method',
    'Upload Evidence',
    'Review',
  ];

  const currentStepIndex =
    step === 'submitting' ? 5 : step === 'success' ? 5 : steps.indexOf(step);

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleNext = () => {
    if (step === 'select-items') setStep('select-reason');
    else if (step === 'select-reason') setStep('select-refund');
    else if (step === 'select-refund') setStep('upload-evidence');
    else if (step === 'upload-evidence') setStep('review');
    else if (step === 'review') handleSubmit();
  };

  const handleBack = () => {
    if (step === 'select-reason') setStep('select-items');
    else if (step === 'select-refund') setStep('select-reason');
    else if (step === 'upload-evidence') setStep('select-refund');
    else if (step === 'review') setStep('upload-evidence');
  };

  const handleSubmit = async () => {
    setStep('submitting');
    setLoading(true);

    try {
      // In production, this would call the API
      const selectedItemsData = orderItems.filter((item) =>
        selectedItems.has(item.id),
      );

      const returnRequest = {
        orderId,
        orderNumber: 'ORD-' + orderId.slice(0, 8),
        returnType:
          selectedItemsData.length === orderItems.length
            ? 'full_order'
            : 'partial_return',
        reason: returnReason,
        reasonDetail,
        items: selectedItemsData.map((item) => ({
          orderItemId: item.id,
          variantId: item.variantId,
          productId: item.productId,
          productName: item.productName,
          variantSku: item.variantSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          reason: returnReason,
          condition: 'as_received',
        })),
        refundMethod,
        customerNotes,
        evidenceUrls: evidenceFiles.map((file) => URL.createObjectURL(file)),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStep('success');
      onSuccess?.(returnRequest);
    } catch (error) {
      console.error('Failed to submit return request:', error);
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  const totalRefundAmount = orderItems
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Return Request Submitted
            </h3>
            <p className="text-muted-foreground mb-6">
              Your return request has been submitted successfully. You will
              receive a confirmation email shortly.
            </p>
            <Button onClick={onCancel} className="w-full">
              View My Returns
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Request a Return</CardTitle>
        <Progress
          value={((currentStepIndex + 1) / steps.length) * 100}
          className="mt-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          {steps.map((s, i) => (
            <span
              key={s}
              className={
                i <= currentStepIndex ? 'text-foreground font-medium' : ''
              }
            >
              {s}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {step === 'select-items' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the items you want to return from this order.
            </p>
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 p-4 border rounded-lg"
              >
                <Checkbox
                  id={item.id}
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={() => toggleItemSelection(item.id)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={item.id}
                    className="font-medium cursor-pointer"
                  >
                    {item.productName}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    SKU: {item.variantSku}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × ₹{item.unitPrice}
                  </p>
                  <Badge variant="neutral" className="mt-2">
                    ₹{item.totalPrice}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 'select-reason' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Why are you returning these items?
            </p>
            <Select value={returnReason} onValueChange={setReturnReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="damaged">Item arrived damaged</SelectItem>
                <SelectItem value="wrong_item">Wrong item received</SelectItem>
                <SelectItem value="not_as_described">
                  Not as described
                </SelectItem>
                <SelectItem value="no_longer_needed">
                  No longer needed
                </SelectItem>
                <SelectItem value="defective">Defective product</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Label htmlFor="reason-detail">Additional Details</Label>
              <Textarea
                id="reason-detail"
                placeholder="Please provide more details about your return reason..."
                value={reasonDetail}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setReasonDetail(e.target.value)
                }
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 'select-refund' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              How would you like to receive your refund?
            </p>
            <Select value={refundMethod} onValueChange={setRefundMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select refund method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original_payment">
                  Original payment method
                </SelectItem>
                <SelectItem value="store_credit">Store credit</SelectItem>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">
                Estimated Refund Amount
              </p>
              <p className="text-2xl font-bold">
                ₹{totalRefundAmount.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {step === 'upload-evidence' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload photos or documents to support your return request.
            </p>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here, or click to select
              </p>
              <Input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEvidenceFiles(Array.from(e.target.files || []))
                }
                className="max-w-xs mx-auto"
              />
            </div>
            {evidenceFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Files:</p>
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please review your return request before submitting.
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Items to Return</p>
                {orderItems
                  .filter((item) => selectedItems.has(item.id))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm py-2 border-b"
                    >
                      <span>
                        {item.productName} (x{item.quantity})
                      </span>
                      <span>₹{item.totalPrice}</span>
                    </div>
                  ))}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Return Reason</p>
                <p className="text-sm">{returnReason}</p>
                {reasonDetail && (
                  <p className="text-sm text-muted-foreground">
                    {reasonDetail}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Refund Method</p>
                <p className="text-sm">{refundMethod.replace('_', ' ')}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between font-medium">
                  <span>Total Refund Amount</span>
                  <span>₹{totalRefundAmount.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="customer-notes">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="customer-notes"
                  placeholder="Any additional information..."
                  value={customerNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCustomerNotes(e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={step === 'select-items' ? onCancel : handleBack}
            disabled={loading}
          >
            {step === 'select-items' ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              loading ||
              (step === 'select-items' && selectedItems.size === 0) ||
              (step === 'select-reason' && !returnReason) ||
              (step === 'select-refund' && !refundMethod)
            }
          >
            {step === 'review' ? 'Submit Return Request' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
