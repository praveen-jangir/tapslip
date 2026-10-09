import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export type StepState = 'done' | 'active' | 'pending';

export interface TimelineStep {
  key: string;
  title: string;
  meta?: string;
  state: StepState;
}

function PulsingDot({ color = Colors.primary, size = 10 }: { color?: string; size?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
      }}
    />
  );
}

export function LiveBadge({ label = 'LIVE' }: { label?: string }) {
  return (
    <View style={styles.live}>
      <PulsingDot color={Colors.success} size={7} />
      <Text style={styles.liveText}>{label}</Text>
    </View>
  );
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.markerCol}>
              <View
                style={[
                  styles.circle,
                  step.state === 'pending' && styles.circlePending,
                  step.state === 'active' && styles.circleActive,
                ]}
              >
                {step.state === 'done' && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                {step.state === 'active' && <PulsingDot />}
              </View>
              {!last && (
                <View style={[styles.line, step.state === 'done' && styles.lineDone]} />
              )}
            </View>
            <View style={[styles.stepBody, !last && { paddingBottom: 18 }]}>
              <Text
                style={[
                  styles.stepTitle,
                  step.state === 'pending' && { color: Colors.textMuted, fontWeight: '600' },
                ]}
              >
                {step.title}
              </Text>
              {step.meta ? (
                <Text
                  style={[
                    styles.stepMeta,
                    step.state === 'active' && { color: Colors.primary, fontWeight: '800' },
                  ]}
                >
                  {step.meta}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 24,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.success,
    letterSpacing: 0.6,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  markerCol: {
    width: 26,
    alignItems: 'center',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePending: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  circleActive: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 22,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: Colors.primary,
  },
  stepBody: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  stepMeta: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
