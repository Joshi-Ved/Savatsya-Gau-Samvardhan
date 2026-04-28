import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS } from '../config/api';

export type Language = 'en' | 'hi' | 'mr';
export type Currency = 'INR' | 'USD' | 'EUR';

export interface LanguageConfig {
  language: Language;
  currency: Currency;
  region: string;
  dateFormat: string;
  numberFormat: string;
}

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}


const translations: Translations = {
  welcome: {
    en: 'Welcome',
    hi: 'स्वागत',
    mr: 'स्वागत'
  },
  home: {
    en: 'Home',
    hi: 'घर',
    mr: 'घर'
  },
  products: {
    en: 'Products',
    hi: 'उत्पाद',
    mr: 'उत्पादने'
  },
  about: {
    en: 'About',
    hi: 'के बारे में',
    mr: 'बद्दल'
  },
  contact: {
    en: 'Contact',
    hi: 'संपर्क',
    mr: 'संपर्क'
  },
  cart: {
    en: 'Cart',
    hi: 'कार्ट',
    mr: 'कार्ट'
  },
  profile: {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    mr: 'प्रोफाइल'
  },
  settings: {
    en: 'Settings',
    hi: 'सेटिंग्स',
    mr: 'सेटिंग्ज'
  },
  login: {
    en: 'Login',
    hi: 'लॉग इन',
    mr: 'लॉगिन'
  },
  logout: {
    en: 'Logout',
    hi: 'लॉग आउट',
    mr: 'लॉगआउट'
  },
  'theme-display': {
    en: 'Theme & Display',
    hi: 'थीम और डिस्प्ले',
    mr: 'थीम आणि डिस्प्ले'
  },
  'language-region': {
    en: 'Language & Region',
    hi: 'भाषा और क्षेत्र',
    mr: 'भाषा आणि प्रदेश'
  },
  notifications: {
    en: 'Notifications',
    hi: 'सूचनाएं',
    mr: 'सूचना'
  },
  'privacy-security': {
    en: 'Privacy & Security',
    hi: 'गोपनीयता और सुरक्षा',
    mr: 'गोपनीयता आणि सुरक्षा'
  },
  language: {
    en: 'Language',
    hi: 'भाषा',
    mr: 'भाषा'
  },
  currency: {
    en: 'Currency',
    hi: 'मुद्रा',
    mr: 'चलन'
  },
  english: {
    en: 'English',
    hi: 'अंग्रेजी',
    mr: 'इंग्रजी'
  },
  hindi: {
    en: 'हिंदी (Hindi)',
    hi: 'हिंदी',
    mr: 'हिंदी'
  },
  marathi: {
    en: 'मराठी (Marathi)',
    hi: 'मराठी',
    mr: 'मराठी'
  },
  'indian-rupee': {
    en: '₹ Indian Rupee (INR)',
    hi: '₹ भारतीय रुपया (INR)',
    mr: '₹ भारतीय रुपया (INR)'
  },
  'language-updated': {
    en: 'Language updated',
    hi: 'भाषा अपडेट की गई',
    mr: 'भाषा अपडेट केली'
  },
  'language-preference-saved': {
    en: 'Your language preference has been saved',
    hi: 'आपकी भाषा प्राथमिकता सहेजी गई है',
    mr: 'तुमची भाषा प्राधान्य जतन केली गेली आहे'
  },
  'newsletter-subscribe': {
    en: 'Subscribe to Newsletter',
    hi: 'न्यूजलेटर की सदस्यता लें',
    mr: 'न्यूजलेटर सब्स्क्राइब करा'
  },
  'subscribe-updates': {
    en: 'Subscribe to get updates on new products and offers',
    hi: 'नए उत्पादों और ऑफर्स के अपडेट पाने के लिए सब्स्क्राइब करें',
    mr: 'नवीन उत्पादने आणि ऑफर्सचे अपडेट मिळविण्यासाठी सब्स्क्राइब करा'
  },
  theme: {
    en: 'Theme',
    hi: 'थीम',
    mr: 'थीम'
  },
  light: {
    en: 'Light',
    hi: 'हल्का',
    mr: 'हलका'
  },
  dark: {
    en: 'Dark',
    hi: 'डार्क',
    mr: 'गडद'
  },
  system: {
    en: 'System',
    hi: 'सिस्टम',
    mr: 'सिस्टम'
  },
  'color-scheme': {
    en: 'Color Scheme',
    hi: 'रंग योजना',
    mr: 'रंग योजना'
  },
  'font-size': {
    en: 'Font Size',
    hi: 'फ़ॉन्ट साइज़',
    mr: 'फॉन्ट साइझ'
  },
  animations: {
    en: 'Animations',
    hi: 'एनिमेशन',
    mr: 'अ‍ॅनिमेशन'
  },
  'high-contrast': {
    en: 'High Contrast',
    hi: 'उच्च कंट्रास्ट',
    mr: 'उच्च कंट्रास्ट'
  },
  'email-notifications': {
    en: 'Email Notifications',
    hi: 'ईमेल सूचनाएं',
    mr: 'ईमेल सूचना'
  },
  'sms-notifications': {
    en: 'SMS Notifications',
    hi: 'SMS सूचनाएं',
    mr: 'SMS सूचना'
  },
  'push-notifications': {
    en: 'Push Notifications',
    hi: 'पुश सूचनाएं',
    mr: 'पुश सूचना'
  },
  'change-password': {
    en: 'Change Password',
    hi: 'पासवर्ड बदलें',
    mr: 'पासवर्ड बदला'
  },
  'enable-2fa': {
    en: 'Enable Two-Factor Authentication',
    hi: 'द्विकारक प्रमाणीकरण सक्षम करें',
    mr: 'द्विघटक प्रमाणीकरण सक्षम करा'
  },
  'download-data': {
    en: 'Download My Data',
    hi: 'मेरा डेटा डाउनलोड करें',
    mr: 'माझा डेटा डाउनलोड करा'
  },
  'delete-account': {
    en: 'Delete Account',
    hi: 'खाता हटाएं',
    mr: 'खाते हटवा'
  },
  'current-password': {
    en: 'Current Password',
    hi: 'वर्तमान पासवर्ड',
    mr: 'सध्याचा पासवर्ड'
  },
  'new-password': {
    en: 'New Password',
    hi: 'नया पासवर्ड',
    mr: 'नवीन पासवर्ड'
  },
  'confirm-password': {
    en: 'Confirm New Password',
    hi: 'नए पासवर्ड की पुष्टि करें',
    mr: 'नवीन पासवर्डची पुष्टी करा'
  },
  'password-changed': {
    en: 'Password changed successfully',
    hi: 'पासवर्ड सफलतापूर्वक बदल दिया गया',
    mr: 'पासवर्ड यशस्वीरित्या बदलला'
  },
  '2fa-enabled': {
    en: 'Two-factor authentication enabled',
    hi: 'द्विकारक प्रमाणीकरण सक्षम किया गया',
    mr: 'द्विघटक प्रमाणीकरण सक्षम केले'
  },
  'data-downloaded': {
    en: 'Your data has been downloaded',
    hi: 'आपका डेटा डाउनलोड किया गया है',
    mr: 'तुमचा डेटा डाउनलोड झाला आहे'
  },
  'account-deletion-scheduled': {
    en: 'Account deletion scheduled',
    hi: 'खाता हटाना निर्धारित किया गया',
    mr: 'खाते हटवणे नियोजित केले'
  },
  save: {
    en: 'Save',
    hi: 'सेव करें',
    mr: 'जतन करा'
  },
  cancel: {
    en: 'Cancel',
    hi: 'रद्द करें',
    mr: 'रद्द करा'
  },
  enable: {
    en: 'Enable',
    hi: 'सक्षम करें',
    mr: 'सक्षम करा'
  },
  disable: {
    en: 'Disable',
    hi: 'अक्षम करें',
    mr: 'अक्षम करा'
  },
  download: {
    en: 'Download',
    hi: 'डाउनलोड करें',
    mr: 'डाउनलोड करा'
  }
};


const currencyConfig = {
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro' }
};

type LanguageContextType = {
  config: LanguageConfig;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  getCurrentLanguageName: () => string;
  getCurrentCurrencyName: () => string;
};

const defaultConfig: LanguageConfig = {
  language: 'en',
  currency: 'INR',
  region: 'IN',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'en-IN'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<LanguageConfig>(defaultConfig);

  useEffect(() => {
   
    const savedConfig = localStorage.getItem('language-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  useEffect(() => {
   
    localStorage.setItem('language-config', JSON.stringify(config));
    
   
    document.documentElement.lang = config.language;
    
   
    document.documentElement.dir = 'ltr';
  }, [config]);

  const setLanguage = (language: Language) => {
    const newConfig = { ...config, language };
    setConfig(newConfig);
    
   
    try {
      const { getAccessToken } = await import('@/lib/authToken');
      const token = getAccessToken();
      if (token) {
        fetch(API_ENDPOINTS.USER.PREFERENCES, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ preferences: { language }, uiConfig: { language } })
        }).catch(() => {});
      }
    } catch (_) {}
  };

  const setCurrency = (currency: Currency) => {
    const newConfig = { ...config, currency };
    setConfig(newConfig);
    
   
    try {
      const { getAccessToken } = await import('@/lib/authToken');
      const token = getAccessToken();
      if (token) {
        fetch(API_ENDPOINTS.USER.PREFERENCES, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ preferences: { currency }, uiConfig: { currency } })
        }).catch(() => {});
      }
    } catch (_) {}
  };

  const t = (key: string): string => {
    return translations[key]?.[config.language] || key;
  };

  const formatCurrency = (amount: number): string => {
    const currInfo = currencyConfig[config.currency];
    const formatter = new Intl.NumberFormat(config.numberFormat, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(config.numberFormat, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const getCurrentLanguageName = (): string => {
    switch (config.language) {
      case 'en': return 'English';
      case 'hi': return 'हिंदी (Hindi)';
      case 'mr': return 'मराठी (Marathi)';
      default: return 'English';
    }
  };

  const getCurrentCurrencyName = (): string => {
    return `${currencyConfig[config.currency].symbol} ${currencyConfig[config.currency].name} (${config.currency})`;
  };

  return (
    <LanguageContext.Provider value={{
      config,
      setLanguage,
      setCurrency,
      t,
      formatCurrency,
      formatDate,
      getCurrentLanguageName,
      getCurrentCurrencyName
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};