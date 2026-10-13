import type { ImageSourcePropType } from 'react-native';

/**
 * Static registry of food photos the owner can assign to menu items.
 * `require()` calls must stay static, so every assignable image is listed here.
 */
export const FOOD_IMAGES: { key: string; label: string; source: ImageSourcePropType }[] = [
  { key: 'paneer-tikka', label: 'Paneer Tikka', source: require('../../assets/food/paneer-tikka.jpg') },
  { key: 'spring-rolls', label: 'Spring Rolls', source: require('../../assets/food/spring-rolls.jpg') },
  { key: 'chicken-wings', label: 'Chicken Wings', source: require('../../assets/food/chicken-wings.jpg') },
  { key: 'french-fries', label: 'French Fries', source: require('../../assets/food/french-fries.jpg') },
  { key: 'butter-chicken', label: 'Butter Chicken', source: require('../../assets/food/butter-chicken.jpg') },
  { key: 'dal-makhani', label: 'Dal Makhani', source: require('../../assets/food/dal-makhani.jpg') },
  { key: 'butter-naan', label: 'Butter Naan', source: require('../../assets/food/butter-naan.jpg') },
  { key: 'garlic-bread', label: 'Garlic Bread', source: require('../../assets/food/garlic-bread.jpg') },
  { key: 'tandoori-roti', label: 'Tandoori Roti', source: require('../../assets/food/tandoori-roti.jpg') },
  { key: 'chicken-biryani', label: 'Chicken Biryani', source: require('../../assets/food/chicken-biryani.jpg') },
  { key: 'masala-dosa', label: 'Masala Dosa', source: require('../../assets/food/masala-dosa.jpg') },
  { key: 'gulab-jamun', label: 'Gulab Jamun', source: require('../../assets/food/gulab-jamun.jpg') },
  { key: 'mojito', label: 'Mojito', source: require('../../assets/food/mojito.jpg') },
  { key: 'soft-drink', label: 'Soft Drink', source: require('../../assets/food/soft-drink.jpg') },
];

export const DEFAULT_FOOD_IMAGE = FOOD_IMAGES[0].source;

export function imageForKey(key: string): ImageSourcePropType {
  return FOOD_IMAGES.find((img) => img.key === key)?.source ?? DEFAULT_FOOD_IMAGE;
}
