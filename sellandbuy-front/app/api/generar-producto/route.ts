import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase/firestore";
import { collection, query, where, limit, getDocs } from "firebase/firestore";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no está configurada" },
        { status: 500 }
      );
    }

    const { nombre, estado, color, targetAudience } = await req.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "El título/nombre base es obligatorio" },
        { status: 400 }
      );
    }

    let similitudTexto = "";
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("status", "==", "active"), limit(30));
      const querySnapshot = await getDocs(q);
      
      const pData: any[] = [];
      querySnapshot.forEach(doc => {
        pData.push(doc.data());
      });

      const searchTerms = nombre.toLowerCase().split(' ').filter((w: string) => w.length > 2);
      
      const filtered = pData.filter(p => {
        if (!p.title) return false;
        const lowerTitle = p.title.toLowerCase();
        return searchTerms.some((term: string) => lowerTitle.includes(term));
      }).slice(0, 10);

      if (filtered.length > 0) {
        similitudTexto = "Productos similares en la app:\n" + filtered.map(p => 
          `- ${p.title} (${p.condition === 'new' ? 'nuevo' : 'usado'}): ${p.price} ${p.currency || 'COP'}`
        ).join("\n");
      }
    } catch (dbErr) {
      console.error("Error al consultar BD local para productos similares:", dbErr);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Eres un asistente experto en publicaciones de marketplace (tipo Facebook Marketplace, OLX o MercadoLibre).

Tu objetivo es generar contenido REALISTA y CONFIABLE, no exagerado ni publicitario.

Basándote en los siguientes datos del producto:

- Nombre base: ${nombre}
- Condición: ${estado || "No especificada"}
- Color: ${color || "No especificado"}
- Otros detalles: ${targetAudience || "Ninguno"}

=====================================
CONTEXTO DE PRECIOS LOCAL
=====================================
${similitudTexto ? similitudTexto : "No se encontraron productos similares en la base de datos local. Estima un precio estándar para el mercado en Colombia."}

=====================================
INSTRUCCIONES OBLIGATORIAS
=====================================

1. Responde ÚNICAMENTE con JSON válido. No incluyas texto adicional.

2. El "titulo":
- Máximo 70 caracteres
- Claro y directo
- Optimizado para búsqueda
- Sin frases exageradas (NO "¡Increíble!" ni "Lo mejor del mercado")

3. La "descripcion":
- Lenguaje natural y humano (como una persona real vendiendo)
- NO usar HTML (prohibido <br>, <ul>, etc.)
- NO usar markdown (**, #, etc.)
- Usar saltos de línea normales con \n
- Tono confiable, no exagerado
- Incluir puntos clave del producto (características y usos)
- No inventar características irreales

Ejemplo de estilo:

"Producto en buen estado.\n\n- Característica 1\n- Característica 2\n\nIdeal para..."

4. "categoria":
Debe ser SOLO uno de:
"Electronics", "Vehicles", "Real Estate", "Home", "Fashion", "Other"

5. "condicion":
Solo "new" o "used"
Si no es claro, asumir "used"

6. "palabras_clave":
- 3 a 5 keywords reales de búsqueda
- No redundantes

7. "atributos":
- Objeto clave-valor
- Incluir color y otros atributos relevantes
- No inventar datos no mencionados

8. "precio_estimado":
Genera un precio estimado equitativo basado en:
- Condición del producto (new/used).
- Tipo de producto.
- Datos de referencia proporcionados en CONTEXTO DE PRECIOS LOCAL (los cuales tienen prioridad).
- "rango": cadena de texto (ej: "800000 - 1000000").
- "moneda": generalmente COP.
- "justificacion": texto breve de por qué se calculó o sugirió ese precio.
- "minimo_numerico": el valor inferior del rango como un número entero sin puntos (ej: 800000)

=====================================
FORMATO DE RESPUESTA
=====================================

{
  "titulo": "string",
  "descripcion": "string",
  "categoria": "string",
  "precio_estimado": {
    "rango": "string",
    "moneda": "COP",
    "justificacion": "string",
    "minimo_numerico": 0
  },
  "palabras_clave": ["string"],
  "atributos": {
    "color": "string",
    "condicion": "string"
  }
}
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const responseText = result.response.text();

    // Al usar responseMimeType: "application/json", Gemini debería regresar solo el JSON
    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error en generar-producto:", error);
    return NextResponse.json(
      { error: "Error al procesar con IA" },
      { status: 500 }
    );
  }
}
