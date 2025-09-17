# API Setup Guide for Slow Look Demo

## Art Institute of Chicago API ✅ READY TO USE

The Art Institute of Chicago API is **completely free and requires no API key**. It's already configured and working in your demo!

- **Documentation**: https://api.artic.edu/docs/
- **Status**: ✅ Ready to use immediately
- **What it provides**: Access to 50,000+ artworks, artist information, and detailed descriptions

## Metropolitan Museum of Art API ✅ READY TO USE

The Met Museum API is **completely free and requires no API key**. It's now integrated and working!

- **Documentation**: https://metmuseum.github.io/
- **Status**: ✅ Ready to use immediately
- **What it provides**: Access to 470,000+ artworks, detailed provenance, exhibition history, and historical context

## Wikipedia API ✅ READY TO USE

The Wikipedia API is **completely free and requires no API key**. It's now integrated for educational content!

- **Documentation**: https://en.wikipedia.org/api/rest_v1/
- **Status**: ✅ Ready to use immediately
- **What it provides**: Artist biographies, art movement information, and educational context

## Optional: Vision APIs (for image analysis)

### Google Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Enable the Vision API
4. Create credentials (API Key)
5. Add to your `.env` file:
   ```
   VITE_GOOGLE_VISION_API_KEY=your_actual_key_here
   ```

### Microsoft Computer Vision API
1. Go to [Azure Portal](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/)
2. Create a Computer Vision resource
3. Get your API key and endpoint
4. Add to your `.env` file:
   ```
   VITE_MICROSOFT_VISION_API_KEY=your_actual_key_here
   VITE_MICROSOFT_VISION_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
   ```

### OpenAI API (NEW! 🚀)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Add to your `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_actual_key_here
   ```
5. **What it provides**: AI-powered artistic analysis, historical context, educational insights, and enhanced descriptions

### Adobe Color API (NEW! 🎨)
1. Go to [Adobe Developer Console](https://developer.adobe.com/console/)
2. Create a new project
3. Add the Color API service
4. Generate an API key
5. Add to your `.env` file:
   ```
   VITE_ADOBE_COLOR_API_KEY=your_actual_key_here
   ```
6. **What it provides**: Advanced color palette analysis, color harmony detection, and color theory insights

## Quick Start

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. The demo will work immediately with Art Institute API (no keys needed)

3. For enhanced image analysis, add your vision API keys to `.env`

## Current Status

- ✅ Art Institute API: Working (no key needed)
- ✅ Metropolitan Museum API: Working (no key needed) - **NEW!**
- ✅ Wikipedia API: Working (no key needed) - **NEW!**
- ⚠️ Google Vision API: Optional (add key to `.env`)
- ⚠️ Microsoft Vision API: Optional (add key to `.env`)
- 🚀 OpenAI API: Optional (add key to `.env`)
- 🎨 Adobe Color API: Optional (add key to `.env`) - **NEW!**

The demo will work with the free APIs (Art Institute, Met Museum, Wikipedia), but adding vision APIs, OpenAI, and Adobe Color will provide much more detailed and educational image analysis with AI-powered insights and advanced color theory.