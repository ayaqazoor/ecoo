import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      change_language: "Change Language",
    },
  },
  ar: {
    translation: {
      welcome: "أهلاً وسهلاً",
      change_language: "تغيير اللغة",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // اللغة الافتراضية
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// تحميل اللغة المحفوظة
AsyncStorage.getItem('appLanguage').then((lang) => {
  if (lang) {
    i18n.changeLanguage(lang);
  }
});

export default i18n;
