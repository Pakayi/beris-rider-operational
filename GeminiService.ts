import { GoogleGenAI } from "@google/genai";
import { Order } from "./types";

// Inisialisasi AI menggunakan API_KEY dari environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeOrderForResponse = async (order: Order) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Kamu adalah asisten admin operasional Beris Rider (Ojek lokal Tasikmalaya).
        Buat pesan WhatsApp singkat dan sopan untuk pelanggan:
        Pelanggan: ${order.customerName}
        Jemput: ${order.pickupLocation}
        Tujuan: ${order.destinationLocation}
        Status: ${order.status}
        Harga: Rp ${order.price.toLocaleString("id-ID")}
        Catatan: ${order.notes || "Tidak ada"}
        
        Gunakan logat sopan khas Tasikmalaya (Sunda halus).
      `,
    });
    return response.text;
  } catch (error) {
    return "Halo Kak, order Beris Rider sedang diproses ya. Mohon ditunggu.";
  }
};

export const searchLocationWithAI = async (query: string) => {
  try {
    // Maps grounding is only supported in Gemini 2.5 series models.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Cari lokasi atau tempat populer di Kota Tasikmalaya berdasarkan permintaan ini: "${query}". Berikan nama tempat yang spesifik dan alamat singkatnya saja.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: -7.3274, // Koordinat Pusat Kota Tasikmalaya
              longitude: 108.2207,
            },
          },
        },
      },
    });

    const text = response.text || "";
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapUri = links.find((c) => c.maps?.uri)?.maps?.uri;

    return {
      name: text.replace(/[*#]/g, "").split("\n")[0],
      details: text,
      mapLink: mapUri,
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return null;
  }
};

export const suggestOperationalStrategy = async (orders: Order[]) => {
  const summary = orders
    .slice(0, 5)
    .map((o) => `${o.pickupLocation} -> ${o.destinationLocation}`)
    .join(", ");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analisis data order Tasikmalaya: ${summary}. Berikan 1 tips singkat strategi ojek hari ini.`,
    });
    return response.text;
  } catch (e) {
    return "Fokus di area Asia Plaza dan Unsil saat jam makan siang.";
  }
};
