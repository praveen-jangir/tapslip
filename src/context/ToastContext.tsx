import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';

export type ToastTone = 'success' | 'info' | 'error';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const TONE_ICONS: Record<ToastTone, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  info: 'information-circle',
  error: 'alert-circle',
};

const TONE_COLORS: Record<ToastTone, string> = {
  success: '#4ADE80',
  info: '#A78BFA',
  error: '#F87171',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    counter.current += 1;
    setToast({ id: counter.current, message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    opacity.stopAnimation();
    translateY.stopAnimation();
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
    ]).start();

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }).start(
        () => setToast(null)
      );
    }, 2400);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [toast, opacity, translateY]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {toast && (
          <Animated.View
            pointerEvents="none"
            style={[styles.toast, { opacity, transform: [{ translateY }] }]}
          >
            <Ionicons
              name={TONE_ICONS[toast.tone]}
              size={19}
              color={TONE_COLORS[toast.tone]}
            />
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#221C33',
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Shadow.card,
  },
  message: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
