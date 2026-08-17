import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return Response.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
    }

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.6-flash',
      contents: message,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;

            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Gemini Stream Error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Gemini API Error:', error);

    return Response.json(
      {
        error: error?.message || 'AI 응답 생성에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
