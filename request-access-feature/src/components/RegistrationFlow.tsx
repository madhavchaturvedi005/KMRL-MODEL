import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Camera, Upload, Search, Building2, User, Shield, CheckCircle } from 'lucide-react';
import { findCompanyByName, getCompanyById } from '@/data/mockCompanies';
import { Company } from '@/types/auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Step 1 Schema - Company Selection
const step1Schema = z.object({
  companyId: z.string().min(1, 'Please select your company'),
});

// Step 2 Schema - Personal Details
const step2Schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  workEmail: z.string().email('Please enter a valid work email address'),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid mobile number'),
});

// Step 3 Schema - Identity Verification
const step3Schema = z.object({
  idType: z.enum(['company_id', 'national_id', 'passport'], {
    required_error: 'Please select an ID type',
  }),
  idDocument: z.any().refine((file) => file instanceof File, 'Please upload your ID document'),
  livePhoto: z.any().refine((file) => file instanceof File, 'Please capture your live photo'),
});

// Step 4 Schema - Review & Confirmation
const step4Schema = z.object({
  confirmAccuracy: z.boolean().refine((val) => val === true, 'Please confirm the information is accurate'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

interface RegistrationFlowProps {
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [companySearch, setCompanySearch] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [uploadedIdDocument, setUploadedIdDocument] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  // Step 3 Form
  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  });

  // Step 4 Form
  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
  });

  const handleCompanySearch = (searchTerm: string) => {
    setCompanySearch(searchTerm);
    if (searchTerm.length > 2) {
      const results = findCompanyByName(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectCompany = (company: Company) => {
    setSelectedCompany(company);
    step1Form.setValue('companyId', company.id);
    setCompanySearch(company.displayName);
    setSearchResults([]);
  };

  const openCamera = async () => {
    try {
      setError('');
      console.log('Requesting camera access...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('Camera access granted, opening modal...');
      setIsCameraOpen(true);
      
      // Wait a bit for the modal to render before setting up video
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, starting playback...');
            videoRef.current?.play().catch(console.error);
          };
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permissions and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Camera is not supported in this browser.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please check permissions and try again.';
      }
      
      setError(errorMessage);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'live-photo.jpg', { type: 'image/jpeg' });
            setCapturedPhoto(file);
            step3Form.setValue('livePhoto', file);
            setError('');
          }
        }, 'image/jpeg', 0.8);
      }
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraOpen(false);
    }
  };

  const closeCameraModal = () => {
    // Stop camera stream when closing modal
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, JPG, or PNG)');
        return;
      }
      step3Form.setValue('idDocument', file);
      setUploadedIdDocument(file);
      setError('');
    }
  };

  const nextStep = async () => {
    setError('');
    
    switch (currentStep) {
      case 1:
        const step1Valid = await step1Form.trigger();
        if (step1Valid) {
          const data = step1Form.getValues();
          setFormData(prev => ({ ...prev, ...data }));
          setCurrentStep(2);
        }
        break;
      case 2:
        const step2Valid = await step2Form.trigger();
        if (step2Valid) {
          const data = step2Form.getValues();
          setFormData(prev => ({ ...prev, ...data }));
          setCurrentStep(3);
        }
        break;
      case 3:
        const step3Valid = await step3Form.trigger();
        if (step3Valid) {
          const data = step3Form.getValues();
          setFormData(prev => ({ ...prev, ...data }));
          setCurrentStep(4);
        }
        break;
      case 4:
        const step4Valid = await step4Form.trigger();
        if (step4Valid) {
          const finalData = { ...formData, ...step4Form.getValues() };
          const result = await onSubmit(finalData);
          if (!result.success) {
            setError(result.error || 'Submission failed');
          }
        }
        break;
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Let's find your organization</h2>
              <p className="text-gray-600">Search for and select your company to get started</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companySearch">Company Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="companySearch"
                    placeholder="Type your company name..."
                    value={companySearch}
                    onChange={(e) => handleCompanySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchResults.length > 0 && (
                  <div className="border rounded-md bg-white shadow-sm max-h-48 overflow-y-auto">
                    {searchResults.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => selectCompany(company)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{company.displayName}</div>
                        <div className="text-sm text-gray-500">{company.name}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {selectedCompany && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">{selectedCompany.displayName}</div>
                        <div className="text-sm text-green-700">Selected</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don't see your company?{' '}
                  <Link to="/register-company" className="text-primary hover:underline">
                    Register it here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Personal Details</h2>
              <p className="text-gray-600">Please provide your professional information</p>
            </div>
            
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  {...step2Form.register('fullName')}
                  className={step2Form.formState.errors.fullName ? 'border-red-500' : ''}
                />
                {step2Form.formState.errors.fullName && (
                  <p className="text-sm text-red-500">{step2Form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Company-Issued Employee ID *</Label>
                  <Input
                    id="employeeId"
                    placeholder="e.g., EMP001"
                    {...step2Form.register('employeeId')}
                    className={step2Form.formState.errors.employeeId ? 'border-red-500' : ''}
                  />
                  {step2Form.formState.errors.employeeId && (
                    <p className="text-sm text-red-500">{step2Form.formState.errors.employeeId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title / Designation *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Station Controller"
                    {...step2Form.register('jobTitle')}
                    className={step2Form.formState.errors.jobTitle ? 'border-red-500' : ''}
                  />
                  {step2Form.formState.errors.jobTitle && (
                    <p className="text-sm text-red-500">{step2Form.formState.errors.jobTitle.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workEmail">Official Work Email Address *</Label>
                <Input
                  id="workEmail"
                  type="email"
                  placeholder="your.name@company.com"
                  {...step2Form.register('workEmail')}
                  className={step2Form.formState.errors.workEmail ? 'border-red-500' : ''}
                />
                {step2Form.formState.errors.workEmail && (
                  <p className="text-sm text-red-500">{step2Form.formState.errors.workEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  placeholder="+91 9876543210"
                  {...step2Form.register('mobileNumber')}
                  className={step2Form.formState.errors.mobileNumber ? 'border-red-500' : ''}
                />
                {step2Form.formState.errors.mobileNumber && (
                  <p className="text-sm text-red-500">{step2Form.formState.errors.mobileNumber.message}</p>
                )}
              </div>
            </form>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
              <p className="text-gray-600">Upload your ID and capture a live photo for verification</p>
            </div>
            
            <div className="space-y-6">
              {/* ID Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ID Document Upload</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type *</Label>
                  <Select onValueChange={(value) => step3Form.setValue('idType', value as any)}>
                    <SelectTrigger className={step3Form.formState.errors.idType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_id">Company ID Card</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                  {step3Form.formState.errors.idType && (
                    <p className="text-sm text-red-500">{step3Form.formState.errors.idType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Upload ID Document *</Label>
                  {!uploadedIdDocument ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900">{uploadedIdDocument.name}</div>
                          <div className="text-sm text-green-700">
                            {(uploadedIdDocument.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setUploadedIdDocument(null);
                          step3Form.setValue('idDocument', undefined as any);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="mt-2"
                      >
                        Change File
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {step3Form.formState.errors.idDocument && (
                    <p className="text-sm text-red-500">{step3Form.formState.errors.idDocument.message}</p>
                  )}
                </div>
              </div>

              {/* Live Photo Capture */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Live Photo Verification</h3>
                
                <div className="space-y-2">
                  <Label>Capture Live Photo *</Label>
                  {!capturedPhoto ? (
                    <div className="text-center space-y-4">
                      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="space-y-2">
                          <Button 
                            type="button" 
                            onClick={() => {
                              console.log('Open Camera button clicked');
                              openCamera();
                            }} 
                            className="mb-2"
                            size="lg"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Open Camera
                          </Button>
                          
                          {/* Test button to verify modal works */}
                          <div className="text-xs text-gray-500">
                            <Button 
                              type="button" 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Test modal button clicked');
                                setIsCameraOpen(true);
                              }}
                            >
                              Test Modal (Debug)
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Click to open camera and capture your live photo
                        </p>
                        
                        {/* Debug info */}
                        <div className="text-xs text-gray-400 mt-2">
                          Modal State: {isCameraOpen ? 'Open' : 'Closed'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <p className="text-sm text-green-700">Live photo captured successfully</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setCapturedPhoto(null);
                          step3Form.setValue('livePhoto', undefined as any);
                        }}
                        className="mt-2"
                      >
                        Retake Photo
                      </Button>
                    </div>
                  )}
                  {step3Form.formState.errors.livePhoto && (
                    <p className="text-sm text-red-500">{step3Form.formState.errors.livePhoto.message}</p>
                  )}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Privacy Notice:</strong> Your ID and photo are used for a one-time verification 
                  by your company's administrator and are not stored for any other purpose.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Review & Confirmation</h2>
              <p className="text-gray-600">Please review your information before submitting</p>
            </div>
            
            <div className="space-y-4">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Company:</strong> {selectedCompany?.displayName}</p>
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Full Name:</strong> {formData.fullName}</p>
                  <p><strong>Employee ID:</strong> {formData.employeeId}</p>
                  <p><strong>Job Title:</strong> {formData.jobTitle}</p>
                  <p><strong>Work Email:</strong> {formData.workEmail}</p>
                  <p><strong>Mobile Number:</strong> {formData.mobileNumber}</p>
                </CardContent>
              </Card>

              {/* Verification Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>ID Type:</strong> {formData.idType?.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>ID Document:</strong> ✓ Uploaded</p>
                  <p><strong>Live Photo:</strong> ✓ Captured</p>
                </CardContent>
              </Card>

              {/* Confirmation Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="confirmAccuracy"
                  onCheckedChange={(checked) => step4Form.setValue('confirmAccuracy', checked as boolean)}
                />
                <Label htmlFor="confirmAccuracy" className="text-sm">
                  I confirm that the information provided is accurate and complete
                </Label>
              </div>
              {step4Form.formState.errors.confirmAccuracy && (
                <p className="text-sm text-red-500">{step4Form.formState.errors.confirmAccuracy.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Access</h1>
          <p className="text-gray-600">Submit your application for review</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
              >
                {currentStep === totalSteps ? (
                  isLoading ? 'Submitting...' : 'Submit Application'
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Camera Modal */}
      <Dialog open={isCameraOpen} onOpenChange={closeCameraModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden z-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Capture Live Photo</DialogTitle>
            <DialogDescription>
              Position your face within the oval guide and click the capture button below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Camera Preview */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie
              />
              
              {/* Oval Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  {/* Dark overlay with oval cutout effect */}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div 
                    className="w-48 h-60 border-4 border-white rounded-full shadow-2xl relative z-10"
                    style={{
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)'
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
              
              {/* Instructions Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-lg">
                Position your face in the oval
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Photo Guidelines:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Face within oval</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Good lighting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Look at camera</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={closeCameraModal}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={capturePhoto} 
              className="bg-green-600 hover:bg-green-700 px-8"
              size="lg"
            >
              <Camera className="mr-2 h-5 w-5" />
              Capture Photo
            </Button>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationFlow;