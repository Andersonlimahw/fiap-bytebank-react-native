import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'pt',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export default i18n;

