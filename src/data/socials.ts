export type SocialIconFamily = 'fa' | 'mci';

export interface SocialLink {
  key: string;
  /** Display name shown under / next to the icon */
  name: string;
  /** Short action hint, e.g. Follow / Chat / Review us */
  action: string;
  /** Glyph name inside the given icon family */
  icon: string;
  family: SocialIconFamily;
  /** Brand colour used to tint the icon */
  color: string;
  /**
   * Where the icon opens.
   * NOTE: replace the placeholder handles/numbers/IDs below with your real links.
   */
  url: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: 'facebook',
    name: 'Facebook',
    action: 'Follow',
    icon: 'facebook',
    family: 'fa',
    color: '#1877F2',
    url: 'https://www.facebook.com/saffrontable', // TODO: your Facebook page
  },
  {
    key: 'instagram',
    name: 'Instagram',
    action: 'Follow',
    icon: 'instagram',
    family: 'fa',
    color: '#E1306C',
    url: 'https://www.instagram.com/saffrontable', // TODO: your Instagram handle
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    action: 'Chat',
    icon: 'whatsapp',
    family: 'fa',
    color: '#25D366',
    url: 'https://wa.me/919876543210', // TODO: country code + phone number
  },
  {
    key: 'maps',
    name: 'Google Maps',
    action: 'Directions',
    icon: 'google-maps',
    family: 'mci',
    color: '#EA4335',
    url: 'https://www.google.com/maps/search/?api=1&query=Saffron+Table', // TODO: your map listing
  },
  {
    key: 'google-reviews',
    name: 'Google Reviews',
    action: 'Review us',
    icon: 'google',
    family: 'fa',
    color: '#4285F4',
    // TODO: replace PLACE_ID with your Google Business Place ID
    url: 'https://search.google.com/local/writereview?placeid=PLACE_ID',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    action: 'Follow',
    icon: 'youtube',
    family: 'fa',
    color: '#FF0000',
    url: 'https://www.youtube.com/@saffrontable', // TODO: your channel
  },
  {
    key: 'twitter',
    name: 'Twitter',
    action: 'Follow',
    icon: 'twitter',
    family: 'fa',
    color: '#1DA1F2',
    url: 'https://x.com/saffrontable', // TODO: your X / Twitter profile
  },
  {
    key: 'tripadvisor',
    name: 'TripAdvisor',
    action: 'Reviews',
    icon: 'tripadvisor',
    family: 'fa',
    color: '#00AF87',
    url: 'https://www.tripadvisor.com/', // TODO: your listing URL
  },
];
