import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function analyzeImages() {
  const zai = await ZAI.create();
  
  const images = [
    '/home/z/my-project/upload/Captura de pantalla 2026-04-07 171207.png',
    '/home/z/my-project/upload/Captura de pantalla 2026-04-07 171217.png',
    '/home/z/my-project/upload/Captura de pantalla 2026-04-07 171234.png'
  ];
  
  for (const imagePath of images) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Esta es una captura de pantalla de un error de Vercel. Por favor describe EXACTAMENTE qué dice el mensaje de error. Incluye todos los detalles del error.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });
    
    console.log(`\n=== ${imagePath.split('/').pop()} ===`);
    console.log(response.choices[0]?.message?.content);
  }
}

analyzeImages().catch(console.error);
