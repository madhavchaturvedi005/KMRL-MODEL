import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Translation data
const translations = {
  en: {
    // Header
    'header.title': 'Knowledge Lens',
    'header.staffPortal': 'Staff Portal',
    'header.aiAssistant': 'AI Assistant',
    'header.notifications': 'Notifications',
    'header.profile': 'Profile',
    'header.settings': 'Settings',
    'header.logout': 'Log out',
    
    // Navigation
    'nav.overview': 'Overview',
    'nav.documents': 'Documents',
    'nav.projects': 'Projects',
    'nav.search': 'Search',
    'nav.connections': 'Connections',
    
    // Dashboard Overview
    'overview.greeting': 'Good morning',
    'overview.briefing': "Here's your personalized briefing for today",
    'overview.totalDocuments': 'Total Documents',
    'overview.activeProjects': 'Active Projects',
    'overview.highPriority': 'High Priority',
    'overview.avgConfidence': 'Avg Confidence',
    
    // Documents
    'documents.title': 'Documents',
    'documents.subtitle': 'Manage and view your uploaded documents',
    'documents.upload': 'Upload',
    'documents.noDocuments': 'No documents yet',
    'documents.getStarted': 'Get started by uploading your first document',
    'documents.aiSummary': 'AI Document Summary',
    'documents.aiDescription': 'Upload a document to get an AI-generated summary, key points, and action items.',
    'documents.extractInfo': 'Extract key information',
    'documents.generateSummary': 'Generate executive summary',
    'documents.identifyActions': 'Identify action items',
    'documents.processAI': 'Process with AI',
    'documents.recentActivity': 'Recent Activity',
    'documents.uploaded': 'Uploaded',
    'documents.noActivity': 'No recent activity. Upload documents to see them here.',
    
    // Upload
    'upload.title': 'Upload Documents',
    'upload.dragDrop': 'Drop files here',
    'upload.clickSelect': 'Or click to select files from your computer',
    'upload.fullySupported': 'Fully Supported (AI Analysis)',
    'upload.basicSupport': 'Basic Support',
    'upload.fileLimit': 'File Size Limit',
    'upload.selectedFiles': 'Selected files',
    'upload.processing': 'Processing...',
    
    // Login
    'login.signIn': 'Sign in to your account',
    'login.welcomeBack': 'Welcome back',
    'login.enterCredentials': 'Enter your credentials to access your account',
    'login.employeeId': 'Employee ID',
    'login.password': 'Password',
    'login.forgotPassword': 'Forgot Password?',
    'login.signInButton': 'Sign In',
    'login.signingIn': 'Signing in...',
    'login.newEmployee': 'New employee?',
    'login.requestAccess': 'Request Access',
    'login.alreadyHaveCredentials': 'Already have credentials?',
    'login.signUp': 'Sign up',
    'login.testCredentials': 'Test Login Credentials',
    'login.runScript': 'Run the insert-test-employee.sql script first to create these test accounts.',
    
    // Language Toggle
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.malayalam': 'മലയാളം',
    'language.select': 'Select Language',
  },
  hi: {
    // Header
    'header.title': 'नॉलेज लेंस',
    'header.staffPortal': 'स्टाफ पोर्टल',
    'header.aiAssistant': 'AI सहायक',
    'header.notifications': 'सूचनाएं',
    'header.profile': 'प्रोफाइल',
    'header.settings': 'सेटिंग्स',
    'header.logout': 'लॉग आउट',
    
    // Navigation
    'nav.overview': 'अवलोकन',
    'nav.documents': 'दस्तावेज़',
    'nav.projects': 'परियोजनाएं',
    'nav.search': 'खोजें',
    'nav.connections': 'कनेक्शन',
    
    // Dashboard Overview
    'overview.greeting': 'सुप्रभात',
    'overview.briefing': 'यहाँ आज के लिए आपकी व्यक्तिगत जानकारी है',
    'overview.totalDocuments': 'कुल दस्तावेज़',
    'overview.activeProjects': 'सक्रिय परियोजनाएं',
    'overview.highPriority': 'उच्च प्राथमिकता',
    'overview.avgConfidence': 'औसत विश्वास',
    
    // Documents
    'documents.title': 'दस्तावेज़',
    'documents.subtitle': 'अपने अपलोड किए गए दस्तावेज़ों को प्रबंधित और देखें',
    'documents.upload': 'अपलोड',
    'documents.noDocuments': 'अभी तक कोई दस्तावेज़ नहीं',
    'documents.getStarted': 'अपना पहला दस्तावेज़ अपलोड करके शुरुआत करें',
    'documents.aiSummary': 'AI दस्तावेज़ सारांश',
    'documents.aiDescription': 'AI-जनरेटेड सारांश, मुख्य बिंदु और कार्य आइटम प्राप्त करने के लिए एक दस्तावेज़ अपलोड करें।',
    'documents.extractInfo': 'मुख्य जानकारी निकालें',
    'documents.generateSummary': 'कार्यकारी सारांश बनाएं',
    'documents.identifyActions': 'कार्य आइटम पहचानें',
    'documents.processAI': 'AI के साथ प्रोसेस करें',
    'documents.recentActivity': 'हाल की गतिविधि',
    'documents.uploaded': 'अपलोड किया गया',
    'documents.noActivity': 'कोई हाल की गतिविधि नहीं। उन्हें यहाँ देखने के लिए दस्तावेज़ अपलोड करें।',
    
    // Upload
    'upload.title': 'दस्तावेज़ अपलोड करें',
    'upload.dragDrop': 'फाइलें यहाँ छोड़ें',
    'upload.clickSelect': 'या अपने कंप्यूटर से फाइलें चुनने के लिए क्लिक करें',
    'upload.fullySupported': 'पूर्ण समर्थित (AI विश्लेषण)',
    'upload.basicSupport': 'बुनियादी समर्थन',
    'upload.fileLimit': 'फाइल साइज़ सीमा',
    'upload.selectedFiles': 'चयनित फाइलें',
    'upload.processing': 'प्रोसेसिंग...',
    
    // Login
    'login.signIn': 'अपने खाते में साइन इन करें',
    'login.welcomeBack': 'वापसी पर स्वागत है',
    'login.enterCredentials': 'अपने खाते तक पहुंचने के लिए अपनी साख दर्ज करें',
    'login.employeeId': 'कर्मचारी आईडी',
    'login.password': 'पासवर्ड',
    'login.forgotPassword': 'पासवर्ड भूल गए?',
    'login.signInButton': 'साइन इन',
    'login.signingIn': 'साइन इन हो रहा है...',
    'login.newEmployee': 'नया कर्मचारी?',
    'login.requestAccess': 'पहुंच का अनुरोध करें',
    'login.alreadyHaveCredentials': 'पहले से ही साख है?',
    'login.signUp': 'साइन अप',
    'login.testCredentials': 'परीक्षण लॉगिन साख',
    'login.runScript': 'इन परीक्षण खातों को बनाने के लिए पहले insert-test-employee.sql स्क्रिप्ट चलाएं।',
    
    // Language Toggle
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.malayalam': 'മലയാളം',
    'language.select': 'भाषा चुनें',
  },
  ml: {
    // Header
    'header.title': 'നോളജ് ലെൻസ്',
    'header.staffPortal': 'സ്റ്റാഫ് പോർട്ടൽ',
    'header.aiAssistant': 'AI സഹായി',
    'header.notifications': 'അറിയിപ്പുകൾ',
    'header.profile': 'പ്രൊഫൈൽ',
    'header.settings': 'ക്രമീകരണങ്ങൾ',
    'header.logout': 'ലോഗ് ഔട്ട്',
    
    // Navigation
    'nav.overview': 'അവലോകനം',
    'nav.documents': 'രേഖകൾ',
    'nav.projects': 'പദ്ധതികൾ',
    'nav.search': 'തിരയുക',
    'nav.connections': 'കണക്ഷനുകൾ',
    
    // Dashboard Overview
    'overview.greeting': 'സുപ്രഭാതം',
    'overview.briefing': 'ഇന്നത്തെ നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങൾ ഇതാ',
    'overview.totalDocuments': 'മൊത്തം രേഖകൾ',
    'overview.activeProjects': 'സജീവ പദ്ധതികൾ',
    'overview.highPriority': 'ഉയർന്ന മുൻഗണന',
    'overview.avgConfidence': 'ശരാശരി വിശ്വാസം',
    
    // Documents
    'documents.title': 'രേഖകൾ',
    'documents.subtitle': 'നിങ്ങളുടെ അപ്‌ലോഡ് ചെയ്ത രേഖകൾ കൈകാര്യം ചെയ്യുകയും കാണുകയും ചെയ്യുക',
    'documents.upload': 'അപ്‌ലോഡ്',
    'documents.noDocuments': 'ഇതുവരെ രേഖകളൊന്നുമില്ല',
    'documents.getStarted': 'നിങ്ങളുടെ ആദ്യ രേഖ അപ്‌ലോഡ് ചെയ്തുകൊണ്ട് ആരംഭിക്കുക',
    'documents.aiSummary': 'AI രേഖ സംഗ്രഹം',
    'documents.aiDescription': 'AI-ജനറേറ്റഡ് സംഗ്രഹം, പ്രധാന പോയിന്റുകൾ, പ്രവർത്തന ഇനങ്ങൾ എന്നിവ ലഭിക്കാൻ ഒരു രേഖ അപ്‌ലോഡ് ചെയ്യുക.',
    'documents.extractInfo': 'പ്രധാന വിവരങ്ങൾ എക്‌സ്ട്രാക്റ്റ് ചെയ്യുക',
    'documents.generateSummary': 'എക്‌സിക്യൂട്ടീവ് സംഗ്രഹം സൃഷ്ടിക്കുക',
    'documents.identifyActions': 'പ്രവർത്തന ഇനങ്ങൾ തിരിച്ചറിയുക',
    'documents.processAI': 'AI ഉപയോഗിച്ച് പ്രോസസ്സ് ചെയ്യുക',
    'documents.recentActivity': 'സമീപകാല പ്രവർത്തനം',
    'documents.uploaded': 'അപ്‌ലോഡ് ചെയ്തത്',
    'documents.noActivity': 'സമീപകാല പ്രവർത്തനമൊന്നുമില്ല. അവ ഇവിടെ കാണാൻ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക.',
    
    // Upload
    'upload.title': 'രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക',
    'upload.dragDrop': 'ഫയലുകൾ ഇവിടെ ഇടുക',
    'upload.clickSelect': 'അല്ലെങ്കിൽ നിങ്ങളുടെ കമ്പ്യൂട്ടറിൽ നിന്ന് ഫയലുകൾ തിരഞ്ഞെടുക്കാൻ ക്ലിക്ക് ചെയ്യുക',
    'upload.fullySupported': 'പൂർണ്ണ പിന്തുണ (AI വിശകലനം)',
    'upload.basicSupport': 'അടിസ്ഥാന പിന്തുണ',
    'upload.fileLimit': 'ഫയൽ വലുപ്പ പരിധി',
    'upload.selectedFiles': 'തിരഞ്ഞെടുത്ത ഫയലുകൾ',
    'upload.processing': 'പ്രോസസ്സിംഗ്...',
    
    // Login
    'login.signIn': 'നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് സൈൻ ഇൻ ചെയ്യുക',
    'login.welcomeBack': 'തിരിച്ചുവരവിൽ സ്വാഗതം',
    'login.enterCredentials': 'നിങ്ങളുടെ അക്കൗണ്ട് ആക്സസ് ചെയ്യാൻ നിങ്ങളുടെ ക്രെഡൻഷ്യലുകൾ നൽകുക',
    'login.employeeId': 'ജീവനക്കാരൻ ഐഡി',
    'login.password': 'പാസ്‌വേഡ്',
    'login.forgotPassword': 'പാസ്‌വേഡ് മറന്നോ?',
    'login.signInButton': 'സൈൻ ഇൻ',
    'login.signingIn': 'സൈൻ ഇൻ ചെയ്യുന്നു...',
    'login.newEmployee': 'പുതിയ ജീവനക്കാരൻ?',
    'login.requestAccess': 'ആക്സസ് അഭ്യർത്ഥിക്കുക',
    'login.alreadyHaveCredentials': 'ഇതിനകം ക്രെഡൻഷ്യലുകൾ ഉണ്ടോ?',
    'login.signUp': 'സൈൻ അപ്പ്',
    'login.testCredentials': 'ടെസ്റ്റ് ലോഗിൻ ക്രെഡൻഷ്യലുകൾ',
    'login.runScript': 'ഈ ടെസ്റ്റ് അക്കൗണ്ടുകൾ സൃഷ്ടിക്കാൻ ആദ്യം insert-test-employee.sql സ്ക്രിപ്റ്റ് പ്രവർത്തിപ്പിക്കുക.',
    
    // Language Toggle
    'language.english': 'English',
    'language.hindi': 'हिंदी',
    'language.malayalam': 'മലയാളം',
    'language.select': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('kmrl_language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('kmrl_language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};