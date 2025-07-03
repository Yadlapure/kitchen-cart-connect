
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequestProgressProps {
  currentStep: number;
}

const RequestProgress = ({ currentStep }: RequestProgressProps) => {
  const steps = [
    { id: 1, title: 'Add Items', description: 'Select products' },
    { id: 2, title: 'Review Request', description: 'Confirm your order' },
    { id: 3, title: 'Get Quotes', description: 'Merchants respond' },
    { id: 4, title: 'Complete', description: 'Order confirmed' }
  ];

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Request Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep 
                    ? 'bg-kitchen-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              <div>
                <div className="font-medium">{step.title}</div>
                <div className="text-sm text-gray-500">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestProgress;
