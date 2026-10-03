export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { image } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la API Key de OpenAI en las variables de entorno.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Sos un nutricionista e IA experta en reconocimiento visual de alimentos.
Analizá la imagen del plato de comida y devolvé ÚNICAMENTE un objeto JSON válido con este formato exacto (sin bloques de código markdown ni texto adicional):
{
  "foods": [
    {
      "name": "Nombre del alimento",
      "grams": 150,
      "kcal": 200,
      "protein": 20,
      "carbs": 10,
      "fat": 5,
      "icon": "🍗"
    }
  ]
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identificá todos los alimentos en este plato y estimá sus gramos y macros.' },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        max_tokens: 600
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const parsedData = JSON.parse(content.replace(/```json|```/g, ''));

    return res.status(200).json(parsedData);
  } catch (error) {
    return res.status(500).json({ error: 'Error al analizar la imagen con la IA.' });
  }
}
