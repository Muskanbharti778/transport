import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Image, StyleSheet, View} from 'react-native';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const AUTO_SLIDE_INTERVAL_MS = 3500;
const SLIDE_HEIGHT = 160; // explicit height — do not switch this back to minHeight

// TODO(marketing): swap these for final branded images. For local assets,
// set imageSource: require('../../../assets/images/promo/xyz.jpg').
// For remote images, set imageUri instead. Don't set both on one slide.
const slides = [
  {
    key: 'trips',
    imageSource: require('../../../assets/images/track-fleet.jpg'),
    title: 'Manage your trips',
    subtitle: 'Create, manage and track the progress of every trip',
  },
  {
    key: 'khata',
    imageSource: require('../../../assets/images/manage.jpeg'),
    title: 'Manage your Khata',
    subtitle: 'Keep track of payments, balances and business transactions',
  },
  {
    key: 'manage',
    imageSource: require('../../../assets/images/carousel-2.jpg'),
    title: 'Manage your fleet',
    subtitle: 'Manage trucks, drivers, expenses and your transport business',
  },
];




export function PromoCarousel() {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const intervalRef = useRef(null);

  const startAutoplay = () => {
    stopAutoplay();
    if (!width) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % slides.length;
        listRef.current?.scrollToOffset({offset: next * width, animated: true});
        return next;
      });
    }, AUTO_SLIDE_INTERVAL_MS);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const handleMomentumEnd = event => {
    if (!width) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
    startAutoplay();
  };

  return (
    <View
      style={styles.wrapper}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? (
        <FlatList
          ref={listRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.key}
          onScrollBeginDrag={stopAutoplay}
          onMomentumScrollEnd={handleMomentumEnd}
          renderItem={({item}) => (
            <View style={[styles.slide, {width}]}>
              <Image
                source={item.imageSource || {uri: item.imageUri}}
                style={styles.slideImage}
                resizeMode="cover"
              />
              <View style={styles.slideOverlay} />
              <View style={styles.slideTextBlock}>
                <AppText variant="heading" color="onInk" style={styles.slideTitle}>
                  {item.title}
                </AppText>
                <AppText variant="body" color="onInk" style={styles.slideSubtitle}>
                  {item.subtitle}
                </AppText>
              </View>
            </View>
          )}
        />
      ) : null}

      <View style={styles.dots}>
        {slides.map((slide, index) => (
          <View
            key={slide.key}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  slide: {
    height: SLIDE_HEIGHT,     // fixed, not minHeight — this is the fix
    width: '100%',            // overridden inline per-item anyway, harmless fallback
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',     // explicit anchor for the absolutely-filled Image
  },
  slideImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
 slideTextBlock: {
  height: SLIDE_HEIGHT,
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.md,
  justifyContent: 'flex-end',
},

slideTitle: {
  marginBottom: spacing.xs,
  fontSize: 20,
  lineHeight: 24,
},

slideSubtitle: {
  opacity: 0.9,
  fontSize: 13,
  lineHeight: 18,
},
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.ink,
  },
});