# Slow Look - Artwork Learning App

A mobile app that teaches users how to look at and understand artworks through AI-powered analysis.

## Features

- **Image Upload**: Users can upload photos of artworks from their camera or gallery
- **AI Analysis**: The app analyzes uploaded artworks using various APIs
- **Educational Content**: Provides detailed information about art techniques, styles, and visual elements
- **Level System**: Gamified learning experience with user levels
- **Clean UI**: Minimalist design focused on the learning experience

## Tech Stack

- React Native
- TypeScript
- React Navigation
- React Native Image Picker
- React Native Vector Icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

3. Run the app:
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx          # Main home screen with upload functionality
│   └── ArtworkAnalysisScreen.tsx # Screen showing artwork analysis results
├── components/                 # Reusable UI components
├── services/                   # API services and data management
└── utils/                      # Utility functions
```

## API Integration

The app is designed to integrate with various art analysis APIs. Currently includes mock data, but can be easily connected to:

- Google Vision API
- Microsoft Computer Vision
- Custom ML models
- Art database APIs (e.g., Art Institute of Chicago API)

## Features Implemented

- ✅ Home screen with level system
- ✅ Image upload functionality
- ✅ Navigation between screens
- ✅ Artwork analysis screen with educational content
- ✅ Responsive design matching the wireframe
- ✅ Loading states and error handling

## Next Steps

1. Integrate with actual art analysis APIs
2. Add user authentication and progress tracking
3. Implement more detailed level progression
4. Add social features (sharing, comments)
5. Expand educational content database
6. Add offline mode support

## License

MIT License
