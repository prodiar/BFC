
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import { MenuItem, User, MenuUpdate, AIInsight, Order } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const bfcFastText = async (message: string, menuItems: MenuItem[], user?: User | null, updates: MenuUpdate[] = []) => {
  try {
    const menuContext = menuItems.map(i => `- ${i.name} (Bn: ${i.nameBn}): ৳${i.price}`).join("\n");
    const systemInstruction = `You are the "BFC Food Assistant". You are helpful, friendly, and love Bangladeshi food. Be concise.
    You can help users add items to their cart using the addItemToCart function.
    MENU:
    ${menuContext}`;

    const addItemToCartDeclaration: FunctionDeclaration = {
      name: 'addItemToCart',
      parameters: {
        type: Type.OBJECT,
        description: 'Add a menu item to the shopping cart.',
        properties: {
          itemName: {
            type: Type.STRING,
            description: 'The exact name of the menu item to add.',
          },
          quantity: {
            type: Type.NUMBER,
            description: 'The number of units to add.',
          },
        },
        required: ['itemName'],
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { 
        systemInstruction, 
        temperature: 0.7,
        tools: [{ functionDeclarations: [addItemToCartDeclaration] }]
      }
    });

    const text = response.text?.trim() || "I'm here to help you order from BFC!";

    return { 
      text,
      functionCalls: response.functionCalls
    };
  } catch (err) {
    return { text: "Hello! How can I help you today?", functionCalls: undefined };
  }
};

export const bfcSpeak = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (err) { return null; }
};

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export const getTacticalInsights = async (orders: Order[], menu: MenuItem[]): Promise<AIInsight> => {
  return { peakHour: "Normal", trendingDish: "Thai Fry", recommendation: "Keep serving great food!" };
};

export const verifyAdminIdentity = async (phrase: string): Promise<boolean> => {
  return phrase === "admin123";
};
