import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase/firestore";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { AI_ENABLED } from "@/lib/constants/ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// TODO: replace with distributed cache (Redis) in production
const productsCache = { timestamp: 0, items: [] as any[] };

export async function POST(req: NextRequest) {
  const fallbackResponse = {
    titulo: "",
    descripcion: "",
    categoria: "Other",
    precio_estimado: null,
    palabras_clave: [],
    atributos: {},
    error: "AI_UNAVAILABLE"
  };

  try {
    if (!AI_ENABLED) {
      return NextResponse.json(fallbackResponse);
    }

    if (!genAI) {
      console.warn("GEMINI_API_KEY no está configurada");
      return NextResponse.json(fallbackResponse);
    }

    const body = await req.json();
    const { nombre, imageUrl, targetAudience } = body;

    if (!nombre && !imageUrl) {
      return NextResponse.json(
        { error: "Se requiere un texto descriptivo o una imagen" },
        { status: 400 }
      );
    }

    // --- 1. Cache en memoria de productos ---
    let pData: any[] = [];
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

    if (Date.now() - productsCache.timestamp < CACHE_TTL && productsCache.items.length > 0) {
      pData = productsCache.items;
    } else {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("status", "==", "active"), limit(30));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(doc => {
          pData.push(doc.data());
        });

        // Guardar en cache
        productsCache.items = pData;
        productsCache.timestamp = Date.now();
      } catch (dbErr) {
        console.error("Error al consultar BD local para productos similares:", dbErr);
      }
    }

    // --- 2. Filtro y Preprocesamiento ---
    let similitudTexto = "";
    if (nombre) {
      const searchTerms = nombre.toLowerCase().split(' ').filter((w: string) => w.length > 2);
      
      const filtered = pData.filter(p => {
        if (!p.title) return false;
        const lowerTitle = p.title.toLowerCase();
        return searchTerms.some((term: string) => lowerTitle.includes(term));
      }).slice(0, 5); // Limitar referencias a máximo 5 (optimización)

      if (filtered.length > 0) {
        similitudTexto = "Productos similares en la app:\n" + filtered.map(p => 
          `- ${p.title} (${p.condition === 'new' ? 'nuevo' : 'usado'}): ${p.price} ${p.currency || 'COP'}`
        ).join("\n");
      }
    }

    // --- 3. Preparación de Prompt (Compacto) ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const instructions = `Eres un asistente experto en publicaciones de marketplace. Genera contenido REALISTA y CONFIABLE.
Basándote en los datos del producto descritos:
${nombre ? `- Descripción base: ${nombre}` : ""}
${targetAudience ? `- Detalles extra: ${targetAudience}` : ""}

=====================================
CONTEXTO DE PRECIOS LOCAL
=====================================
${similitudTexto ? similitudTexto : "Sin datos locales. Estima un precio estándar para el mercado en Colombia."}

=====================================
INSTRUCCIONES
=====================================
1. Responde ÚNICAMENTE con JSON válido.
2. "titulo": Claro, directo, máx 70 chars. Sin frases exageradas.
3. "descripcion": Lenguaje natural, como humano. Puntos clave. Sin markdown (**,#).
4. "categoria": SOLO una: "Electronics", "Vehicles", "Real Estate", "Home", "Fashion", "Other".
5. "condicion": "new" o "used". Por defecto "used".
6. "palabras_clave": 3 a 5 keywords reales.
7. "atributos": Objeto clave-valor (ej: color).
8. "precio_estimado": genera rango string ("800000 - 1000000"), USD o COP, justificacion breve, minimo_numerico (número entero).
9. "confidencia": Si la imagen o descripción proveída NO tiene sentido para un producto, o es dudosa, pon "baja". De lo contrario "alta".
10. "preguntas_dinamicas": Si "confidencia" es "baja", provee un arreglo de strings con hasta 3 preguntas clave para que el usuario aclare qué producto es o su estado. De lo contrario, un arreglo vacío.

=====================================
FORMATO
=====================================
{
  "titulo": "string",
  "descripcion": "string",
  "categoria": "string",
  "precio_estimado": { "rango": "string", "moneda": "COP", "justificacion": "string", "minimo_numerico": 0 },
  "palabras_clave": ["string"],
  "atributos": { "color": "string", "condicion": "string" },
  "confidencia": "alta" | "baja",
  "preguntas_dinamicas": ["string"]
}
`;

    // --- 4. Subida de la Parte de Imagen (si URL provista) ---
    const parts: any[] = [{ text: instructions }];

    if (imageUrl) {
      try {
        const imageRes = await fetch(imageUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

        parts.push({
          inlineData: {
            data: base64,
            mimeType,
          }
        });
      } catch (imgErr) {
        console.error("Error al descargar la imagen de la URL para Gemini:", imgErr);
        // Continuar de todos modos con solo texto si falla la img
      }
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error crítico en generar-producto:", error);
    // Retornamos nuestro fallback estructurado
    return NextResponse.json(fallbackResponse, { status: 200 }); // Status 200 intencionado para manejar fallback silencioso UX
  }
}
