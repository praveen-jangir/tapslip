# Tapslip – Mobile App (React Native)

Customer-facing mobile app for Tapslip. Built with **React Native + TypeScript**.

## Screens
| Screen | Description |
|---|---|
| `SplashScreen` | Animated splash / onboarding |
| `ScanScreen` | QR code scanner for table |
| `OrderTypeScreen` | Dine-in / Takeaway / Delivery selection |
| `MenuHomeScreen` | Full menu with categories |
| `CategoryScreen` | Items by category |
| `FoodDetailScreen` | Item details + customisations |
| `CartScreen` | Cart review & place order |
| `OrderPlacedScreen` | Order confirmed |
| `TrackScreen` | Live order status tracker |
| `OrderHistoryScreen` | Past orders |
| `OrderDetailsScreen` | Single order details |
| `FeedbackScreen` | Rate & review |
| `SavedDishesScreen` | Favourites |
| `HelpScreen` | FAQs & support |
| `MoreScreen` | Settings & extras |

## Setup

```bash
cd mobile-app
npm install
npx react-native run-android   # Android
npx react-native run-ios       # iOS
```

## Folder Structure
```
mobile-app/
├── src/
│   ├── App.tsx
│   ├── screens/       ← All screen components
│   ├── components/    ← Reusable UI components
│   ├── context/       ← OrderContext, ToastContext
│   ├── navigation/    ← Stack & Tab navigators
│   ├── data/          ← Menu data (menu.ts)
│   ├── theme/         ← Colors & design tokens
│   └── utils/         ← Format helpers
├── scripts/           ← Build & image scripts
├── package.json
└── tsconfig.json
```
