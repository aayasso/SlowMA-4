# Slow Look - Comprehensive Educational Art Analysis App

A sophisticated mobile app that transforms artwork analysis from simple identification into a rich, educational experience. Instead of focusing on identifying specific artists or titles, the app teaches users how to look at and understand art through comprehensive analysis of style, technique, theme, and medium.

## Educational Philosophy

The app follows a **call-and-recall pattern** that creates engaging, educational narratives:

1. **Vision Analysis**: Multiple APIs analyze visual elements in parallel
2. **AI Interpretation**: OpenAI generates initial educational insights
3. **Targeted Recall**: Additional APIs called based on AI insights for deeper analysis
4. **Final Synthesis**: All data combined into comprehensive educational content

## Key Features

- **Comprehensive API Integration**: Clarifai, Google Vision, Microsoft Vision, OpenAI, Wikipedia, Met Museum, Harvard Art Museums, Art Institute of Chicago
- **Educational Focus**: Teaches visual literacy, color theory, composition, and art history
- **Interactive Learning**: Reflection questions, discussion prompts, and learning objectives
- **Rich Content**: Style analysis, technique breakdown, thematic exploration, and historical context
- **Adaptive Analysis**: Dynamic API calls based on artwork characteristics
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

The app uses a sophisticated multi-API approach for comprehensive educational analysis:

### Vision APIs (Stage 1 - Parallel Execution)
- **Clarifai**: Broad visual concepts and labels
- **Google Vision**: Detailed object detection, text recognition, color analysis
- **Microsoft Vision**: Categories, descriptions, and additional visual features

### AI Analysis (Stage 2)
- **OpenAI GPT-4**: Generates initial educational insights focusing on style, technique, theme, and medium

### Targeted Recall APIs (Stage 3 - Dynamic Calls)
- **Wikipedia**: Historical and cultural context
- **Metropolitan Museum of Art**: Comparative examples and historical data
- **Harvard Art Museums**: Additional museum data (if API key available)
- **Art Institute of Chicago**: Free access to additional artwork examples
- **Art Search API**: Aggregated art database access (if available)

### Educational Content Generation (Stage 4)
- **OpenAI GPT-4**: Final synthesis combining all data sources into comprehensive educational content

## Features Implemented

- ✅ Comprehensive educational analysis system
- ✅ Multi-API integration with call-and-recall pattern
- ✅ Rich educational content generation
- ✅ Interactive learning interface with reflection questions
- ✅ Style, technique, theme, and medium analysis
- ✅ Color theory and composition analysis
- ✅ Historical context and cultural background
- ✅ Learning objectives and discussion prompts
- ✅ Comparative examples and artistic movements
- ✅ Responsive design with educational focus
- ✅ Loading states and error handling

## Educational Content Structure

The app generates comprehensive educational content including:

- **Style Analysis**: Artistic movements, characteristics, and visual language
- **Technique Analysis**: Materials, methods, and technical innovations
- **Theme Analysis**: Symbolic elements, emotional tone, and cultural context
- **Medium Analysis**: Material properties and historical significance
- **Color Analysis**: Color theory, harmony, and psychological impact
- **Composition Analysis**: Visual principles and spatial relationships
- **Learning Resources**: Key concepts, activities, and vocabulary
- **Reflection Questions**: Interactive prompts for deeper engagement

## Configuration

### Required Environment Variables

```bash
# Vision APIs
VITE_GOOGLE_VISION_API_KEY=your_google_vision_key
VITE_MICROSOFT_VISION_API_KEY=your_microsoft_key
VITE_MICROSOFT_VISION_ENDPOINT=your_microsoft_endpoint
VITE_CLARIFAI_API_KEY=your_clarifai_key

# AI Analysis
VITE_OPENAI_API_KEY=your_openai_key

# Museum APIs (Optional)
VITE_HARVARD_ART_MUSEUMS_API_KEY=your_harvard_key
VITE_ARTSEARCH_API_KEY=your_artsearch_key
```

### Free APIs (No Keys Required)
- Wikipedia (via AllOrigins proxy)
- Metropolitan Museum of Art
- Art Institute of Chicago

## Next Steps

1. Add user authentication and progress tracking
2. Implement adaptive learning based on user responses
3. Add collaborative features (group discussions, sharing)
4. Expand educational content database
5. Add assessment tools and quizzes
6. Implement offline mode support
7. Add more museum and art database integrations

## License

MIT License
