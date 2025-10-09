import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, LoginType } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const signupSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  loginType: z.enum(['admin', 'staff'], {
    required_error: 'Please select a login type',
  }),
  role: z.enum(['Station Controller', 'Procurement Officer', 'Rolling Stock Engineer', 'Safety Officer', 'Field Technician'], {
    required_error: 'Please select a role',
  }),
  department: z.string().min(1, 'Department is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const loginTypeOptions = [
  { value: 'admin', label: 'Administrator', description: 'Full system access and user management' },
  { value: 'staff', label: 'Staff', description: 'Standard user access for KMRL operations' },
];

const roleOptions = [
  { value: 'Station Controller', label: 'Station Controller', description: 'Manage station operations and passenger services' },
  { value: 'Procurement Officer', label: 'Procurement Officer', description: 'Handle procurement and vendor management' },
  { value: 'Rolling Stock Engineer', label: 'Rolling Stock Engineer', description: 'Maintain and manage rolling stock' },
  { value: 'Safety Officer', label: 'Safety Officer', description: 'Ensure safety compliance and protocols' },
  { value: 'Field Technician', label: 'Field Technician', description: 'Field maintenance and technical support' },
];

const departmentOptions = [
  'Administration',
  'Operations',
  'Engineering',
  'Procurement',
  'Safety',
  'Maintenance',
  'IT',
  'HR',
  'Finance',
  'Customer Service',
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const selectedLoginType = watch('loginType');
  const selectedRole = watch('role');

  const onSubmit = async (data: SignupFormData) => {
    setError('');
    const result = await signup(data);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* KMRL Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Lens</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Join the team</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="e.g., EMP005"
                    {...register('employeeId')}
                    className={errors.employeeId ? 'border-red-500' : ''}
                  />
                  {errors.employeeId && (
                    <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginType">Login Type *</Label>
                <Select onValueChange={(value) => setValue('loginType', value as LoginType)}>
                  <SelectTrigger className={errors.loginType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your login type" />
                  </SelectTrigger>
                  <SelectContent>
                    {loginTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.loginType && (
                  <p className="text-sm text-red-500">{errors.loginType.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select onValueChange={(value) => setValue('role', value as UserRole)}>
                    <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select onValueChange={(value) => setValue('department', value)}>
                    <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-500">{errors.department.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
