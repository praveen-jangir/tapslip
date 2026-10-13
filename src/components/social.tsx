import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useToast } from '../context/ToastContext';
import { RESTAURANT_NAME } from '../data/menu';
import { SOCIAL_LINKS, type SocialLink } from '../data/socials';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';

function SocialGlyph({ link, size }: { link: SocialLink; size: number }) {
  if (link.family === 'mci') {
    return (
      <MaterialCommunityIcons
        name={link.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size}
        color={link.color}
      />
    );
  }
  return (
    <FontAwesome
      name={link.icon as keyof typeof FontAwesome.glyphMap}
      size={size}
      color={link.color}
    />
  );
}

function useOpenSocial() {
  const { show } = useToast();
  return async (link: SocialLink) => {
    try {
      const canOpen = await Linking.canOpenURL(link.url);
      if (!canOpen) throw new Error('cannot open');
      show(`Opening ${link.name}…`, 'info');
      await Linking.openURL(link.url);
    } catch {
      show(`Couldn't open ${link.name}`, 'error');
    }
  };
}

/** List of social rows (icon + name + action) — used on the More screen. */
export function SocialRowList() {
  const open = useOpenSocial();
  return (
    <View>
      {SOCIAL_LINKS.map((link) => (
        <Pressable
          key={link.key}
          onPress={() => open(link)}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          accessibilityRole="link"
          accessibilityLabel={`${link.name} — ${link.action}`}
        >
          <View style={[styles.rowIcon, { backgroundColor: `${link.color}1A` }]}>
            <SocialGlyph link={link} size={19} />
          </View>
          <Text style={styles.rowLabel}>{link.name}</Text>
          <Text style={styles.rowHint}>{link.action}</Text>
          <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

/** Card with icon + name grid — footer for the menu home screen. */
export function FollowUsCard() {
  const open = useOpenSocial();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Follow &amp; Review Us</Text>
      <Text style={styles.cardSub}>
        Join {RESTAURANT_NAME} — tap any icon to open
      </Text>
      <View style={styles.grid}>
        {SOCIAL_LINKS.map((link) => (
          <Pressable
            key={link.key}
            onPress={() => open(link)}
            style={({ pressed }) => [styles.gridItem, pressed && { opacity: 0.7 }]}
            accessibilityRole="link"
            accessibilityLabel={`${link.name} — ${link.action}`}
          >
            <View
              style={[
                styles.gridCircle,
                { backgroundColor: `${link.color}14`, borderColor: `${link.color}33` },
              ]}
            >
              <SocialGlyph link={link} size={21} />
            </View>
            <Text style={styles.gridLabel} numberOfLines={1}>
              {link.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    ...Shadow.soft,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  rowHint: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadow.soft,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 3,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
    gap: 6,
  },
  gridCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textSecondary,
    maxWidth: '100%',
  },
});
