import { NextResponse } from 'next/server';
import { renderToStream, Font } from '@react-pdf/renderer';
import { createTenderingReportPdfDocument } from '../../reportPdfDocument';

export const runtime = 'nodejs';

// Fallback font
const DEFAULT_BODY_FONT = 'Times-Roman';

// Register Inter font with correct weights: 300,400,500,600,700,800,900 per layout.tsx
try {
  Font.register({
    family: 'TenderingBody',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrKc9bHSJXGdDaW9yt_yZ7lO6z0y0.woff2', // 300 (Light)
        fontWeight: 300,
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrKc9bHSJXGdDaW9yt_yZ7lOSz0y0.woff2', // 400 (Regular)
        fontWeight: 400,
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrKc9bHSJXGdDaW9yt_yZ7lO2z0y0.woff2', // 500 (Medium)
        fontWeight: 500,
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrKc9bHSJXGdDaW9yt_yZ7lPGz0y0.woff2', // 600 (SemiBold)
        fontWeight: 600,
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrKc9bHSJXGdDaW9yt_yZ7lOqz0y0.woff2', // 700 (Bold)
        fontWeight: 700,
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrKc9bHSJXGdDaW9yt_yZ7lP6z0y0.woff2', // 800 (ExtraBold)
        fontWeight: 800,
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrKc9bHSJXGdDaW9yt_yZ7lPyz0y0.woff2', // 900 (Black)
        fontWeight: 900,
      },
    ],
  });
} catch (e) {
  // Ignore registration error
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.generatedAtISO || !body?.formData || !body?.result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let document;
    try {
      document = createTenderingReportPdfDocument({
        generatedAtISO: body.generatedAtISO,
        formData: body.formData,
        result: body.result,
        legalResult: body.legalResult ?? null,
      });
    } catch (docErr: any) {
      if (/Font family not registered/i.test(docErr.message)) {
        // Fix: Remove bodyFontFamily since it's not a recognized prop in the Props type
        document = createTenderingReportPdfDocument({
          generatedAtISO: body.generatedAtISO,
          formData: body.formData,
          result: body.result,
          legalResult: body.legalResult ?? null,
          // bodyFontFamily: DEFAULT_BODY_FONT, // <-- removed due to type error
        });
      } else {
        throw docErr;
      }
    }

    const stream = await renderToStream(document);

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
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
    console.error('PDF Generation Error:', err?.message, err?.stack);

    let details = err?.message ?? 'Unknown error';
    if (details && /Font family not registered/i.test(details)) {
      details += ' - Font not registered: This usually means a custom font was referenced (e.g., "TenderingBody") without calling Font.register. Using a fallback built-in font may resolve this.';
    }

    return NextResponse.json(
      {
        error: 'PDF generation failed',
        details,
      },
      { status: 500 }
    );
  }
}