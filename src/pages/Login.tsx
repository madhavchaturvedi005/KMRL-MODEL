import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

const loginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    const result = await login({
      employeeId: data.employeeId,
      password: data.password
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <div className="w-full max-w-md">
        {/* KMRL Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('header.title')}</h1>
          <p className="text-gray-600">{t('login.signIn')}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t('login.welcomeBack')}</CardTitle>
            <CardDescription className="text-center">
              {t('login.enterCredentials')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="employeeId">{t('login.employeeId')}</Label>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="Enter your employee ID"
                  {...register('employeeId')}
                  className={errors.employeeId ? 'border-red-500' : ''}
                />
                {errors.employeeId && (
                  <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('login.signingIn')}
                  </>
                ) : (
                  t('login.signInButton')
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                New employee?{' '}
                <Link
                  to="/request-access"
                  className="text-primary hover:underline font-medium"
                >
                  Request Access
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Already have credentials?{' '}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Employee ID:</strong> employee@kmrl.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
          <div className="mt-2 text-xs text-blue-600">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
