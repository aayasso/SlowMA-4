# Slow Look Demo

A web-based demo of the Slow Look mobile app that teaches users how to look at and understand artworks.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd demo
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   The app will automatically open at `http://localhost:3000`

## 📱 Features

- **Responsive Design**: Works on both desktop and mobile browsers
- **Image Upload**: Click "Upload new artwork" to select an image file
- **AI Analysis Simulation**: Mock analysis with educational content
- **Level System**: Visual level indicator (currently level 3)
- **Educational Content**: Detailed information about art techniques and visual elements

## 🎨 How to Use

1. **Home Screen**: 
   - See your current level (3)
   - Click "Upload new artwork" to select an image
   - View demo features

2. **Analysis Screen**:
   - View your uploaded artwork
   - Read detailed analysis including:
     - Artwork information (title, artist, period)
     - Key techniques used
     - Visual elements breakdown
     - Learning guidance
     - Progress tracking

## 🛠️ Technical Details

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Lucide React** for icons
- **CSS** for styling (mobile-first responsive design)

## 📁 Project Structure

```
demo/
├── src/
│   ├── components/
│   │   ├── HomeScreen.tsx          # Main home screen
│   │   ├── HomeScreen.css          # Home screen styles
│   │   ├── ArtworkAnalysisScreen.tsx # Analysis screen
│   │   └── ArtworkAnalysisScreen.css # Analysis screen styles
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json                    # Dependencies
├── vite.config.ts                  # Vite configuration
└── README.md                       # This file
```

## 🔧 Customization

The demo uses mock data for the artwork analysis. To integrate with real APIs:

1. Replace the mock data in `ArtworkAnalysisScreen.tsx`
2. Add your API endpoints
3. Implement proper error handling
4. Add loading states for API calls

## 📱 Mobile Testing

The demo is designed to look like a mobile app on desktop. For mobile testing:

1. Open the demo on your phone's browser
2. Add to home screen for app-like experience
3. Test touch interactions and file upload

## 🎯 Next Steps

- Integrate with real art analysis APIs
- Add user authentication
- Implement level progression
- Add more educational content
- Create user profiles and history
