import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function analyzeImages() {
  const zai = await ZAI.create();
  
  const images = [
    '/home/z/my-project/upload/Screenshot_2026-04-07-18-57-44-527_com.android.chrome.jpg',
    '/home/z/my-project/upload/Screenshot_2026-04-07-18-59-42-202_com.android.chrome.jpg'
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
              text: 'Esta es una captura de pantalla de un error en una aplicación web. Por favor describe EXACTAMENTE qué dice el mensaje de error. Si hay texto en español, mantenlo en español.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
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
