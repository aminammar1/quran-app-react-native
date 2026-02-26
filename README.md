# 📖 Quran App (React Native)

A beautifully crafted, modern React Native iOS/Android application designed for reading, exploring, and listening to the Holy Quran. 

Built with extremely polished Liquid Glass / iOS 26 aesthetics and optimized for maximum reader engagement using Expo.

![Quran App UI 1](./assets/IMG_4780.png)
![Quran App UI 2](./assets/IMG_4781.png)

---

## ✨ Features

- **Modern Glassmorphism UI**: Employs deep translucent blurred navbars and players styled after modern iOS layout paradigms.
- **Multilingual Support**: Swap contextually between native Arabic `(القرآن الكريم)` and English on the fly. Reading modes dynamically render Arabic, English, or Both side-by-side using high quality Amiri fonts.
- **Robust Searching Engine**: Contains a rigorous normalization engine. You can search easily without needing strict Arabic diacritics (tashkeel).
- **Background Audio Player**: Fully integrated with the latest `expo-audio` SDK 52. Features a custom native-styled transparent Audio Player that docks seamlessly to the bottom layout, complete with Background Context & Skip Forward/Backward support!
- **Dynamic Theme Awareness**: Respects system Safe Area Insets gracefully (notches, islands, home indicators). Layout intelligently handles infinite scrolling behind floated tab components.
- **Multiple Elite Reciters**: Switch seamlessly between top global reciters (Mishary Alafasy, Yasser Al-Dosari, Abdul Rahman Al-Sudais, etc.). 
- **Offline Memory Optimization**: Heavily cached APIs ensure reading experiences are rapid, smooth, and network resilient! 

## 🔋 Technology Stack

- **Framework:** [React Native](https://reactnative.dev)
- **Toolchain:** [Expo SDK 52+](https://expo.dev/)
- **Audio Engine:** `expo-audio` (Modern replacement for `expo-av`)
- **Navigation:** `@react-navigation/bottom-tabs` & `@react-navigation/native-stack`
- **Styling / Layouts:** `expo-blur` / `expo-linear-gradient` / `react-native-safe-area-context`
- **State Management:** `zustand` (For reactive Audio control flow) & Multi-level contexts
- **API Source:** [Al Quran Cloud API](https://alquran.cloud/api) & MP3Quran

---

## 🚀 Getting Started

To run this application deeply on your own machine. 

### Prerequisites

- Node.js (>= 18.x)
- Expo CLI
- Expo Go installed on your iOS/Android device OR a configured local simulator.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Quran
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # OR
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npx expo start -c
   ```

4. **Launch Application:**
   Open the application via **Expo Go** by scanning the generated QR Code on your mobile device!

## 🛣 Future Roadmap

- Additional Translation selections (Urdu, Bengali, French)
- Word-By-Word Audio Highlighting 
- Full Offline Zip Package Downloads (Mushaf caching)

## 🐛 Troubleshooting

- **Crash on Start / TurboModuleRegistry**: If running inside `Expo Go` avoid ejecting or trying to link arbitrary native modules (like Callstack LiquidGlass) that require low-level AGSL shaders. This app has been optimized purely for `BlurView` to yield maximum native speeds right inside Expo!
- **Audio Overlaps**: Ensure `expo-audio` replaces `expo-av`, otherwise the latest SDK updates will throw deprecation loops.

---

*Made for the sake of Allah.*
