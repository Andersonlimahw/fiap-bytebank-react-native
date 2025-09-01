import React, { useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, useWindowDimensions, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useUIStore } from '~/store/app.store';

type Slide = {
  key: string;
  title: string;
  description: string;
  // Using optional local images later if added to assets
  image?: any;
};

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const completeOnboarding = useUIStore((s) => s.completeOnboarding);

  const slides: Slide[] = useMemo(
    () => [
      {
        key: 'welcome',
        title: t('onboarding.welcomeTitle'),
        description: t('onboarding.welcomeDescription'),
      },
      {
        key: 'security',
        title: t('onboarding.securityTitle'),
        description: t('onboarding.securityDescription'),
      },
      {
        key: 'features',
        title: t('onboarding.featuresTitle'),
        description: t('onboarding.featuresDescription'),
      },
      {
        key: 'getStarted',
        title: t('onboarding.lastTitle'),
        description: t('onboarding.lastDescription'),
      },
    ],
    [t]
  );

  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const onNext = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      onFinish();
    }
  };

  const onSkip = () => onFinish();
  const onFinish = () => {
    completeOnboarding();
    // After completing onboarding, Stack will show SignIn automatically
    // but to make UX snappy, we can also navigate
    // @ts-ignore – route may exist depending on stack
    navigation.navigate('SignIn' as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Top bar with Skip */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('onboarding.skip')} onPress={onSkip}>
          <Text style={{ color: '#666', fontWeight: '600' }}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' }}>
            {/* Illustration placeholder: could use real asset later */}
            <View
              style={{
                width: width * 0.7,
                height: width * 0.5,
                borderRadius: 16,
                backgroundColor: '#F1F5F9',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 48 }}>💳</Text>
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '800',
                textAlign: 'center',
                color: '#0F172A',
                marginBottom: 8,
              }}
            >
              {item.title}
            </Text>
            <Text style={{ fontSize: 16, textAlign: 'center', color: '#475569' }}>{item.description}</Text>
          </View>
        )}
      />

      {/* Progress + CTA */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          {slides.map((s, i) => (
            <View
              key={s.key}
              style={{
                height: 8,
                width: i === index ? 24 : 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: i === index ? '#2563EB' : '#CBD5E1',
              }}
              accessibilityLabel={i === index ? t('onboarding.progressActive') : t('onboarding.progressInactive')}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel={index === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          style={{
            backgroundColor: '#2563EB',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            {index === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 8 }} />
        <TouchableOpacity onPress={onSkip} accessibilityRole="button" accessibilityLabel={t('onboarding.skip')} style={{ alignItems: 'center' }}>
          <Text style={{ color: '#64748B', fontWeight: '600' }}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

