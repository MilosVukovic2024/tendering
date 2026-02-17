import { NextResponse } from 'next/server';
import { renderToStream, Font } from '@react-pdf/renderer';
import { createTenderingReportPdfDocument } from '../../reportPdfDocument';

export const runtime = 'nodejs';

// Use TTF instead of WOFF2 for better compatibility with react-pdf
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf', fontWeight: 700 },
  ],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.generatedAtISO || !body?.formData || !body?.result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const document = createTenderingReportPdfDocument({
      generatedAtISO: body.generatedAtISO,
      formData: body.formData,
      result: body.result,
      legalResult: body.legalResult ?? null,
    });

    // Use renderToStream for better performance/stability in Prod
    const stream = await renderToStream(document);

    // Convert stream to Buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      // Ensure chunk is converted to Uint8Array if necessary
      if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk, 'utf-8'));
      } else {
        chunks.push(Buffer.from(chunk));
      }
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="tendering_izvjestaj.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    // CRITICAL: Log the actual error message to your dashboard
    console.error('PDF Generation Error:', err.message, err.stack);

    return NextResponse.json({
      error: 'PDF generation failed',
      details: err.message,
    }, { status: 500 });
  }
}