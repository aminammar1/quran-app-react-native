# 📖 Quran App (React Native)

A modern, beautifully designed mobile Quran application for iOS and Android, built with React Native and Expo.

![Quran App UI 1](./assets/animation.jpeg)
![Quran App UI 2](./assets/IMG_4781.png)
![Quran App UI 3](./assets/IMG_4782.png)
![Quran App UI 4](./assets/IMG_4783.png)

---

## ✨ Features

- **Glassmorphism UI** — Translucent blur effects inspired by modern iOS design, with edge-to-edge bottom navigation and audio player.
- **Full Arabic & English Support** — Switch the entire app language between Arabic and English instantly. All UI elements, reciter names, surah names, and labels translate dynamically.
- **Smart Arabic Search** — Search surahs by name without worrying about diacritics (tashkeel). The normalization engine handles Alif variants, Teh Marbuta, and more.
- **Integrated Audio Player** — Stream full surah recitations with play/pause, skip forward/backward, and a built-in surah picker, all from a sleek bottom player bar.
- **Multiple Reciters** — Choose from famous reciters including Mishary Alafasy, Yasser Al-Dosari, Abdur-Rahman As-Sudais, Maher Al-Muaiqly, and more.
- **Dual Reading Modes** — View ayahs in Arabic only, English only, or both side-by-side.
- **Per-Verse Audio** — Listen to individual ayah recitations with a single tap.
- **Safe Area Aware** — Respects device notches, home indicators, and dynamic islands on all modern devices.
- **API Caching** — Fast, resilient browsing with intelligent in-memory caching.

---

## 🔋 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev) |
| Toolchain | [Expo SDK 52+](https://expo.dev/) |
| Audio | `expo-audio` |
| Navigation | `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` |
| Visual Effects | `expo-blur`, `expo-linear-gradient` |
| State | `zustand`, React Context |
| Fonts | [Amiri](https://fonts.google.com/specimen/Amiri) (Arabic calligraphic) |
| API | [Al Quran Cloud](https://alquran.cloud/api), [MP3Quran](https://mp3quran.net), [EveryAyah](https://everyayah.com) |

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components (SurahCard, AyahCard, AudioPlayerBar, etc.)
├── constants/        # Theme tokens, API endpoints, translations
├── context/          # React Context providers (Audio, Language)
├── navigation/       # Stack & Tab navigators
├── screens/          # App screens (Home, SurahDetail, Settings, Bookmarks)
├── services/         # API service layer
├── store/            # Zustand stores
├── styles/           # Extracted StyleSheet files
└── types/            # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- [Expo Go](https://expo.dev/client) on your iOS/Android device, or a local simulator

### Installation

```bash
# Clone the repo
git clone https://github.com/aminammar1/quran-app-react-native.git
cd quran-app-react-native

# Install dependencies
npm install

# Start the dev server
npx expo start -c
```

Scan the QR code with Expo Go to launch the app on your device.

---

## 🛣 Roadmap

- [ ] Additional translations (Urdu, Bengali, French)
- [ ] Word-by-word audio highlighting
- [ ] Offline surah downloads
- [ ] Bookmarks & reading progress tracking

---

*Made for the sake of Allah.*
