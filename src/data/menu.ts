import type { ImageSourcePropType } from 'react-native';

export type CategoryName =
  | 'Starters'
  | 'Main Course'
  | 'Breads'
  | 'Rice'
  | 'Desserts'
  | 'Beverages';

export const CATEGORIES = [
  'All',
  'Starters',
  'Main Course',
  'Breads',
  'Rice',
  'Desserts',
  'Beverages',
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];

export interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  longDescription: string;
  category: CategoryName;
  image: ImageSourcePropType;
  /** Custom uploaded photo (base64 data URL). Bundled presets use `imageKey` only. */
  imageData?: string | null;
}
  image: ImageSourcePropType;
  veg: boolean;
  spiceOption: boolean;
  popular?: boolean;
}

export const RESTAURANT_NAME = 'Saffron Table';

export const DISHES: Dish[] = [
  {
    id: 'paneer-tikka',
    name: 'Paneer Tikka',
    price: 280,
    description: 'Grilled cottage cheese marinated with spices',
    longDescription:
      'Grilled cottage cheese marinated in yogurt, Indian spices and herbs, served sizzling with mint chutney and onion rings.',
    category: 'Starters',
    image: require('../../assets/food/paneer-tikka.jpg'),
    veg: true,
    spiceOption: true,
    popular: true,
  },
  {
    id: 'spring-rolls',
    name: 'Veg Spring Rolls',
    price: 220,
    description: 'Crispy rolls filled with fresh vegetables',
    longDescription:
      'Golden crispy rolls stuffed with finely shredded vegetables and noodles, served with a sweet chilli dipping sauce.',
    category: 'Starters',
    image: require('../../assets/food/spring-rolls.jpg'),
    veg: true,
    spiceOption: false,
    popular: true,
  },
  {
    id: 'chicken-wings',
    name: 'Chicken Wings',
    price: 280,
    description: 'Spicy & crispy chicken wings',
    longDescription:
      'Juicy chicken wings tossed in our signature spicy glaze, fried to a crisp and finished with a sprinkle of herbs.',
    category: 'Starters',
    image: require('../../assets/food/chicken-wings.jpg'),
    veg: false,
    spiceOption: true,
  },
  {
    id: 'french-fries',
    name: 'French Fries',
    price: 180,
    description: 'Golden crispy fries',
    longDescription:
      'Classic salted golden fries, fried fresh and served hot with ketchup and house mayonnaise.',
    category: 'Starters',
    image: require('../../assets/food/french-fries.jpg'),
    veg: true,
    spiceOption: false,
  },
  {
    id: 'garlic-bread',
    name: 'Garlic Bread',
    price: 160,
    description: 'Fresh bread with garlic and herbs',
    longDescription:
      'Freshly baked bread topped with butter, minced garlic and oregano, baked until golden and served warm.',
    category: 'Starters',
    image: require('../../assets/food/garlic-bread.jpg'),
    veg: true,
    spiceOption: false,
  },
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    price: 340,
    description: 'Rich & creamy tomato curry with chicken',
    longDescription:
      'Tender tandoori chicken simmered in a silky tomato-butter gravy with cream and kasuri methi. A timeless classic.',
    category: 'Main Course',
    image: require('../../assets/food/butter-chicken.jpg'),
    veg: false,
    spiceOption: true,
    popular: true,
  },
  {
    id: 'dal-makhani',
    name: 'Dal Makhani',
    price: 220,
    description: 'Slow-cooked black lentils in creamy gravy',
    longDescription:
      'Whole black lentils slow-cooked overnight with butter, cream and tomatoes for a deep, comforting flavour.',
    category: 'Main Course',
    image: require('../../assets/food/dal-makhani.jpg'),
    veg: true,
    spiceOption: false,
  },
  {
    id: 'masala-dosa',
    name: 'Masala Dosa',
    price: 180,
    description: 'Crispy dosa stuffed with spiced potato',
    longDescription:
      'Fermented rice crepe filled with buttery spiced potato, served with coconut chutney and sambar.',
    category: 'Main Course',
    image: require('../../assets/food/masala-dosa.jpg'),
    veg: true,
    spiceOption: false,
    popular: true,
  },
  {
    id: 'chicken-biryani',
    name: 'Chicken Biryani',
    price: 320,
    description: 'Fragrant basmati rice with tender chicken',
    longDescription:
      'Dum-cooked long-grain basmati rice layered with marinated chicken, fried onions and aromatic spices, served with raita.',
    category: 'Rice',
    image: require('../../assets/food/chicken-biryani.jpg'),
    veg: false,
    spiceOption: true,
    popular: true,
  },
  {
    id: 'butter-naan',
    name: 'Butter Naan',
    price: 60,
    description: 'Soft tandoor bread brushed with butter',
    longDescription:
      'Pillowy naan straight from the tandoor, generously brushed with melted butter and a touch of garlic.',
    category: 'Breads',
    image: require('../../assets/food/butter-naan.jpg'),
    veg: true,
    spiceOption: false,
  },
  {
    id: 'tandoori-roti',
    name: 'Tandoori Roti',
    price: 40,
    description: 'Whole wheat bread from the tandoor',
    longDescription:
      'Rustic whole wheat roti baked in the clay tandoor until lightly charred and puffed.',
    category: 'Breads',
    image: require('../../assets/food/tandoori-roti.jpg'),
    veg: true,
    spiceOption: false,
  },
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun',
    price: 120,
    description: 'Warm milk dumplings in sugar syrup',
    longDescription: 'Soft khoya dumplings soaked in rose-cardamom sugar syrup, served warm.',
    category: 'Desserts',
    image: require('../../assets/food/gulab-jamun.jpg'),
    veg: true,
    spiceOption: false,
    popular: true,
  },
  {
    id: 'mojito',
    name: 'Mojito',
    price: 180,
    description: 'Refreshing mint & lime cooler',
    longDescription:
      'Muddled mint and lime with sparkling soda over crushed ice — a perfectly refreshing cooler.',
    category: 'Beverages',
    image: require('../../assets/food/mojito.jpg'),
    veg: true,
    spiceOption: false,
    popular: true,
  },
  {
    id: 'soft-drink',
    name: 'Soft Drink',
    price: 90,
    description: 'Chilled soft drink of your choice',
    longDescription: 'Ice-cold chilled soft drink of your choice, served in a glass with ice.',
    category: 'Beverages',
    image: require('../../assets/food/soft-drink.jpg'),
    veg: true,
    spiceOption: false,
  },
];

export function getDish(id: string): Dish | undefined {
  return DISHES.find((dish) => dish.id === id);
}

export function dishesByCategory(category: CategoryName): Dish[] {
  return DISHES.filter((dish) => dish.category === category);
}

export function searchDishes(query: string): Dish[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DISHES.filter(
    (dish) =>
      dish.name.toLowerCase().includes(q) ||
      dish.description.toLowerCase().includes(q) ||
      dish.category.toLowerCase().includes(q)
  );
}

export const POPULAR_DISHES: Dish[] = DISHES.filter((dish) => dish.popular);

export const RECOMMENDED_DISHES: Dish[] = [
  DISHES.find((d) => d.id === 'chicken-biryani')!,
  DISHES.find((d) => d.id === 'mojito')!,
];

export const RESTAURANT_ADDRESS = '12 Residency Road, Bengaluru 560025';

export const RESTAURANT_GSTIN = '29AABCT3345K1Z6';

/**
 * Preset photos the owner can pick from when adding a dish in the admin panel.
 * (New dishes can't `require()` new assets at runtime, so we reuse bundled images.)
 */
export const DISH_IMAGE_PRESETS: { key: string; source: ImageSourcePropType; label: string }[] = [
  { key: 'paneer-tikka', source: require('../../assets/food/paneer-tikka.jpg'), label: 'Paneer Tikka' },
  { key: 'spring-rolls', source: require('../../assets/food/spring-rolls.jpg'), label: 'Spring Rolls' },
  { key: 'chicken-wings', source: require('../../assets/food/chicken-wings.jpg'), label: 'Chicken Wings' },
  { key: 'french-fries', source: require('../../assets/food/french-fries.jpg'), label: 'French Fries' },
  { key: 'garlic-bread', source: require('../../assets/food/garlic-bread.jpg'), label: 'Garlic Bread' },
  { key: 'butter-chicken', source: require('../../assets/food/butter-chicken.jpg'), label: 'Butter Chicken' },
  { key: 'dal-makhani', source: require('../../assets/food/dal-makhani.jpg'), label: 'Dal Makhani' },
  { key: 'masala-dosa', source: require('../../assets/food/masala-dosa.jpg'), label: 'Masala Dosa' },
  { key: 'chicken-biryani', source: require('../../assets/food/chicken-biryani.jpg'), label: 'Biryani' },
  { key: 'butter-naan', source: require('../../assets/food/butter-naan.jpg'), label: 'Butter Naan' },
  { key: 'tandoori-roti', source: require('../../assets/food/tandoori-roti.jpg'), label: 'Tandoori Roti' },
  { key: 'gulab-jamun', source: require('../../assets/food/gulab-jamun.jpg'), label: 'Gulab Jamun' },
  { key: 'mojito', source: require('../../assets/food/mojito.jpg'), label: 'Mojito' },
  { key: 'soft-drink', source: require('../../assets/food/soft-drink.jpg'), label: 'Soft Drink' },
];
