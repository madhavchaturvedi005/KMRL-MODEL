import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import RegistrationFlow from '@/components/RegistrationFlow';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';
import { RegistrationApplicationData } from '@/types/auth';

const RequestAccess: React.FC = () => {
  const navigate = useNavigate();
  const { submitRegistrationApplication, isLoading } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data: RegistrationApplicationData): Promise<{ success: boolean; error?: string }> => {
    const result = await submitRegistrationApplication(data);
    
    if (result.success) {
      setIsSubmitted(true);
    }
    
    return result;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted</h1>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank you!</h2>
              
              <div className="space-y-4 text-gray-600">
                <p>
                  Your application has been sent to your company's administrator for review.
                </p>
                
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Mail className="h-5 w-5" />
                  <span className="text-sm">You will receive an email with your login credentials once approved.</span>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm">
                    <strong>What happens next?</strong>
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Your company admin will review your application</li>
                    <li>• They'll verify your ID document and live photo</li>
                    <li>• You'll receive email notification of the decision</li>
                    <li>• If approved, you'll get your login credentials</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Return to Login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <RegistrationFlow 
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
};

export default RequestAccess;