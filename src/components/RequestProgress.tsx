
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface RequestProgressProps {
  currentStep: number;
}

const RequestProgress = ({ currentStep }: RequestProgressProps) => {
  const steps = [
    { id: 1, title: 'Add Items', description: 'Select products' },
    { id: 2, title: 'Review Cart', description: 'Check your items' },
    { id: 3, title: 'Select Merchants', description: 'Choose vendors' },
    { id: 4, title: 'Submit Request', description: 'Send to merchants' },
  ];

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Request Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : currentStep === step.id ? (
                <Clock className="w-5 h-5 text-blue-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
              <div className={`flex-1 ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className="font-medium text-sm">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestProgress;
