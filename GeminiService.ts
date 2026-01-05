import { GoogleGenAI } from "@google/genai";
import { Order } from "./types";

// Fungsi untuk inisialisasi AI setiap dipanggil agar selalu pakai API KEY terbaru dari env
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeOrderForResponse = async (order: Order) => {
  try {
    const ai = getAI();
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
        
        Gunakan logat sopan khas Tasikmalaya (Sunda halus). Contoh: "Wilujeng siang Teh/A..."
      `,
    });
    return response.text;
  } catch (error) {
    return "Halo Kak, order Beris Rider sedang diproses ya. Mohon ditunggu.";
  }
};

export const searchLocationWithAI = async (query: string) => {
  const ai = getAI();

  // STRATEGI 1: Pakai Gemini 2.5 dengan Google Maps Tool (Paling Akurat jika billing aktif)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Tolong carikan nama tempat yang akurat di Kota/Kabupaten Tasikmalaya untuk input ini: "${query}".`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: -7.3274,
              longitude: 108.2207,
            },
          },
        },
      },
    });

    const text = response.text || "";
    const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks || [];
    const mapUri = groundingChunks.find((c: any) => c.maps?.uri)?.maps?.uri;

    if (text && text.length > 3) {
      return {
        name: text.replace(/[*#]/g, "").split("\n")[0].trim().substring(0, 70),
        details: text,
        mapLink: mapUri,
      };
    }
  } catch (e) {
    console.warn("Maps tool failed/restricted. Switching to Strategy 2...");
  }

  // STRATEGI 2: Fallback ke Gemini 3 Flash (Pencarian Teks berbasis Knowledge AI)
  try {
    const fallbackResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Kamu adalah ahli geografi Tasikmalaya. Sebutkan nama tempat/gedung/jalan yang paling mungkin di Tasikmalaya untuk kata kunci: "${query}". Cukup berikan nama tempatnya saja dalam satu baris.`,
    });
    const resultText = fallbackResponse.text?.trim();
    if (resultText && resultText.length > 2 && !resultText.toLowerCase().includes("maaf")) {
      return {
        name: resultText,
        details: "Lokasi ditemukan via AI Knowledge Base",
        mapLink: null,
      };
    }
  } catch (err) {
    console.error("Strategy 2 failed. Using raw query.");
  }

  return { name: query, details: "Input Manual", mapLink: null };
};

export const suggestOperationalStrategy = async (orders: Order[]) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan 1 tips singkat strategi ojek di Tasikmalaya berdasarkan data ini: ${JSON.stringify(orders.slice(0, 10))}`,
    });
    return response.text;
  } catch (e) {
    return "Tingkatkan kehadiran di area Unsil dan Asia Plaza saat jam makan siang.";
  }
};
