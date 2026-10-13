import React from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { ButtonHeight, Radius, Shadow } from '../theme/tokens';

export function Logo({
  size = 34,
  light = false,
  showText = true,
}: {
  size?: number;
  light?: boolean;
  showText?: boolean;
}) {
  return (
    <View style={styles.logoRow}>
      <View
        style={[
          styles.logoMark,
          {
            width: size,
            height: size,
            borderRadius: size * 0.3,
            backgroundColor: light ? 'rgba(255,255,255,0.16)' : Colors.primaryMuted,
            borderColor: light ? 'rgba(255,255,255,0.7)' : Colors.primary,
          },
        ]}
      >
        <Ionicons name="restaurant" size={size * 0.55} color={light ? Colors.white : Colors.primary} />
      </View>
      {showText && (
        <Text
          style={[
            styles.logoText,
            { fontSize: size * 0.58, color: light ? Colors.white : Colors.primary },
          ]}
        >
          Tapslip
        </Text>
      )}
    </View>
  );
}

interface AppHeaderProps {
  title?: string;
  onBack?: (() => void) | undefined;
  right?: React.ReactNode;
  light?: boolean;
  bordered?: boolean;
}

export function AppHeader({ title, onBack, right, light = false, bordered = true }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: light ? 'transparent' : Colors.white,
          borderBottomWidth: bordered ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: light ? 'rgba(255,255,255,0.14)' : Colors.divider,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerSide}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [
                styles.iconBtn,
                light && styles.iconBtnLight,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={light ? Colors.white : Colors.text} />
            </Pressable>
          ) : null}
        </View>
        <Text style={[styles.headerTitle, light && { color: Colors.white }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
    </View>
  );
}

interface PrimaryButtonProps {
  label: string;
  onPress?: (() => void) | undefined;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap | undefined;
}

export function PrimaryButton({ label, onPress, disabled = false, style, icon }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && styles.primaryBtnDisabled,
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={disabled ? Colors.textMuted : Colors.white} />
      ) : null}
      <Text style={[styles.primaryLabel, disabled && { color: Colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

interface SecondaryButtonProps {
  label: string;
  onPress?: (() => void) | undefined;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap | undefined;
}

export function SecondaryButton({ label, onPress, disabled = false, style, icon }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.secondaryBtn,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={Colors.primary} /> : null}
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function TextButton({
  label,
  onPress,
  color = Colors.primary,
  style,
}: {
  label: string;
  onPress?: (() => void) | undefined;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ height: 44, justifyContent: 'center' }, pressed && { opacity: 0.6 }, style]}
    >
      <Text style={[styles.textLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active = false,
  onPress,
  icon,
  style,
}: {
  label: string;
  active?: boolean;
  onPress?: (() => void) | undefined;
  icon?: keyof typeof Ionicons.glyphMap | undefined;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? Colors.white : Colors.textSecondary} />
      ) : null}
      <Text style={[styles.chipLabel, active && { color: Colors.white }]}>{label}</Text>
    </Pressable>
  );
}

export function TableChip({ table }: { table: number | null }) {
  return (
    <View style={styles.tableChip}>
      <Ionicons name="restaurant-outline" size={13} color={Colors.primary} />
      <Text style={styles.tableChipLabel}>{table != null ? `Table ${table}` : 'Take Away'}</Text>
    </View>
  );
}

export type BadgeTone = 'success' | 'warning' | 'active' | 'neutral' | 'danger';

const BADGE_PALETTE: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: Colors.successLight, fg: Colors.success },
  warning: { bg: Colors.warningLight, fg: '#B45309' },
  active: { bg: Colors.primaryLight, fg: Colors.primary },
  neutral: { bg: Colors.surfaceAlt, fg: Colors.textSecondary },
  danger: { bg: Colors.dangerLight, fg: Colors.danger },
};

export function StatusBadge({
  label,
  tone = 'neutral',
  dot = true,
}: {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
}) {
  const palette = BADGE_PALETTE[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      {dot ? <View style={[styles.badgeDot, { backgroundColor: palette.fg }]} /> : null}
      <Text style={[styles.badgeLabel, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (option: string) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text
              style={[
                styles.segmentLabel,
                active && { color: Colors.white, fontWeight: '700' },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  );
}

export function RadioRow({
  label,
  subtitle,
  selected,
  onPress,
}: {
  label: string;
  subtitle?: string | undefined;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.radioRow, pressed && { opacity: 0.7 }]}
    >
      <Radio selected={selected} />
      <View style={{ flex: 1 }}>
        <Text style={styles.radioLabel}>{label}</Text>
        {subtitle ? <Text style={styles.radioSubtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => pressed && { opacity: 0.6 }}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string | undefined;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={38} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: 22, alignSelf: 'stretch' }}
        />
      ) : null}
    </View>
  );
}

export function InfoBanner({
  text,
  icon = 'bulb-outline',
  actionLabel,
  onAction,
  tone = 'primary',
}: {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  tone?: 'primary' | 'warning';
}) {
  return (
    <Pressable
      onPress={onAction}
      disabled={!onAction}
      style={({ pressed }) => [
        styles.banner,
        tone === 'warning' && { backgroundColor: Colors.warningLight },
        pressed && onAction && { opacity: 0.8 },
      ]}
    >
      <View style={styles.bannerIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={tone === 'warning' ? '#B45309' : Colors.primary}
        />
      </View>
      <Text style={styles.bannerText}>{text}</Text>
      {actionLabel && onAction ? (
        <Text style={[styles.bannerAction, tone === 'warning' && { color: '#B45309' }]}>
          {actionLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function VegMark({ veg }: { veg: boolean }) {
  const color = veg ? Colors.success : Colors.danger;
  return (
    <View style={[styles.vgBox, { borderColor: color }]}>
      <View style={[styles.vegDot, { backgroundColor: color }]} />
    </View>
  );
}

export type DietFilter = 'all' | 'veg' | 'nonveg';

const DIET_SEGMENTS = [
  { key: 'veg', color: Colors.success, label: 'Veg only' },
  { key: 'all', color: Colors.textMuted, label: 'Show all' },
  { key: 'nonveg', color: Colors.danger, label: 'Non-veg only' },
] as const;

const DIET_TRACK_W = 68;
const DIET_PAD = 4;
const DIET_THUMB = 22;
const DIET_STEP = (DIET_TRACK_W - DIET_PAD * 2 - DIET_THUMB) / 2;

/**
 * Label-free sliding radio for dietary preference:
 * green dot = veg, neutral dot = all, red dot = non-veg.
 */
export function DietFilterSlider({
  value,
  onChange,
}: {
  value: DietFilter;
  onChange: (value: DietFilter) => void;
}) {
  const index = DIET_SEGMENTS.findIndex((segment) => segment.key === value);
  const anim = React.useRef(new Animated.Value(index)).current;

  const select = (next: number) => {
    if (next === index) return;
    Animated.spring(anim, {
      toValue: next,
      friction: 9,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onChange(DIET_SEGMENTS[next].key);
  };

  return (
    <View style={styles.dietTrack}>
      {DIET_SEGMENTS.map((segment, i) => (
        <Pressable
          key={segment.key}
          style={styles.dietSegment}
          onPress={() => select(i)}
          accessibilityRole="button"
          accessibilityLabel={segment.label}
          accessibilityState={{ selected: segment.key === value }}
          hitSlop={6}
        >
          <View style={[styles.dietDot, { backgroundColor: segment.color }]} />
        </Pressable>
      ))}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.dietThumb,
          {
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [0, 2],
                  outputRange: [0, DIET_STEP * 2],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoMark: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  logoText: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  header: {
    paddingBottom: 10,
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  headerSide: {
    width: 88,
    justifyContent: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  iconBtnLight: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  primaryBtn: {
    height: ButtonHeight,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.button,
  },
  primaryBtnDisabled: {
    backgroundColor: Colors.surfaceAlt,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: ButtonHeight,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryLabel: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  textLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tableChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },
  tableChipLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeLabel: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: Colors.primary,
  },
  segmentLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  radioSubtitle: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 36,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    padding: 14,
  },
  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 19,
  },
  bannerAction: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  vgBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  vegDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 2,
  },
  dietTrack: {
    width: DIET_TRACK_W,
    height: 30,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    paddingHorizontal: DIET_PAD,
    paddingVertical: DIET_PAD,
  },
  dietSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dietDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dietThumb: {
    position: 'absolute',
    left: DIET_PAD,
    top: DIET_PAD,
    width: DIET_THUMB,
    height: DIET_THUMB,
    borderRadius: DIET_THUMB / 2,
    backgroundColor: Colors.white,
    ...Shadow.card,
  },
});
