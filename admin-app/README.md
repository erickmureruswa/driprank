# DripRank Admin — Mobile App

React Native (Expo) admin dashboard for DRIPRANK.

---

## Quick Start (Expo Go — instant testing, no build needed)

```bash
cd admin-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone:
- Android → [Expo Go on Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS → [Expo Go on App Store](https://apps.apple.com/app/expo-go/id982107779)

Your account must have `role = 'admin'` in the `profiles` table.

---

## Production APK Build (Android — downloadable install file)

### Prerequisites
```bash
npm install -g eas-cli
eas login   # use your Expo account
```

### Build APK (free, runs in Expo cloud)
```bash
cd admin-app
eas build --platform android --profile preview
```

- Build takes ~10-15 minutes in Expo's cloud
- When done, EAS gives you a **direct APK download URL**
- Share this URL with any admin — they download and install it
- No Google Play account required for APK install
- Enable "Install from unknown sources" on the Android device

### Build for Google Play Store (AAB)
```bash
eas build --platform android --profile production
```

### Check build status
```bash
eas build:list
```

---

## Screens

| Screen | Description |
|--------|-------------|
| **Overview** | Revenue, orders, users, designs stats |
| **Designs** | Toggle visibility/featured, delete designs |
| **Sales** | View and update order statuses |
| **Settings** | WhatsApp number, pricing config, sign out |

---

## Admin Access

To grant admin access to a user, run this SQL in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'user@email.com'
  LIMIT 1
);
```

Current admins:
- `erickmureruswa@gmail.com`
- `makosapauljunior@gmail.com`

---

## Environment Variables

The app reads Supabase credentials from `lib/supabase.js`. For production builds,
set them as EAS secrets:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key"
```
