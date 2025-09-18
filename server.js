// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Helper function for forwarding requests
const proxyRequest = async (req, res, targetUrl, headers = {}) => {
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
};

// -------- CLARIFAI --------
app.post("/proxy/clarifai/v2/models/:modelId/outputs", (req, res) => {
  const modelId = req.params.modelId || process.env.VITE_CLARIFAI_MODEL_ID;
  const targetUrl = `https://api.clarifai.com/v2/models/${modelId}/outputs`;

  proxyRequest(req, res, targetUrl, {
    Authorization: `Key ${process.env.VITE_CLARIFAI_API_KEY}`,
  });
});

// -------- MICROSOFT VISION --------
app.post("/proxy/microsoft/vision/analyze", (req, res) => {
  const region = process.env.VITE_MICROSOFT_REGION || "eastus";
  const targetUrl = `https://${region}.api.cognitive.microsoft.com/vision/v3.2/analyze?visualFeatures=Categories,Description,Color`;

  proxyRequest(req, res, targetUrl, {
    "Ocp-Apim-Subscription-Key": process.env.VITE_MICROSOFT_API_KEY,
  });
});

// -------- GOOGLE VISION --------
app.post("/proxy/google/vision", (req, res) => {
  const targetUrl = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VITE_GOOGLE_API_KEY}`;
  proxyRequest(req, res, targetUrl);
});

// -------- OPENAI --------
app.post("/proxy/openai/chat", (req, res) => {
  const targetUrl = "https://api.openai.com/v1/chat/completions";
  proxyRequest(req, res, targetUrl, {
    Authorization: `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
  });
});

// -------- HARVARD ART MUSEUMS --------
app.get("/proxy/harvard/:endpoint(*)", (req, res) => {
  const endpoint = req.params.endpoint;
  const hasQuery = endpoint.includes("?");
  const separator = hasQuery ? "&" : "?";
  const targetUrl = `https://api.harvardartmuseums.org/${endpoint}${separator}apikey=${process.env.VITE_HARVARD_API_KEY}`;
  proxyRequest(req, res, targetUrl);
});

// -------- MET MUSEUM (no key required, just forward) --------
app.get("/proxy/met/:endpoint(*)", (req, res) => {
  const endpoint = req.params.endpoint;
  const targetUrl = `https://collectionapi.metmuseum.org/public/collection/v1/${endpoint}`;
  proxyRequest(req, res, targetUrl);
});

// -------- ARTSEARCH (Custom, update base URL if needed) --------
app.get("/proxy/artsearch/:endpoint(*)", (req, res) => {
  const endpoint = req.params.endpoint;
  const targetUrl = `https://your-artsearch-api.com/${endpoint}`;
  proxyRequest(req, res, targetUrl, {
    "x-api-key": process.env.VITE_ARTSEARCH_API_KEY || "",
  });
});

// -------- WIKIPEDIA --------
app.get("/proxy/wikipedia/:endpoint(*)", (req, res) => {
  const endpoint = req.params.endpoint;
  const targetUrl = `https://en.wikipedia.org/w/api.php?${endpoint}`;
  proxyRequest(req, res, targetUrl);
});

// -------- START SERVER --------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});


