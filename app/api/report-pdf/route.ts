import { NextResponse } from 'next/server';
import { renderToStream, Font } from '@react-pdf/renderer';
import { createTenderingReportPdfDocument } from '../../reportPdfDocument';

export const runtime = 'nodejs';

// Register a default fallback font (such as 'Times-Roman' which comes bundled with react-pdf/renderer)
const DEFAULT_BODY_FONT = 'Times-Roman';

// Register Inter as a preferred font if resources are available
try {
  Font.register({
    family: 'Inter',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf', fontWeight: 700 },
    ],
  });
} catch (e) {
  // If registration fails, we will rely on the builtin fonts like Times-Roman
  // This catch is just for safety - react-pdf's Font.register does not usually throw
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.generatedAtISO || !body?.formData || !body?.result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let document;
    try {
      // Only pass known/allowed props to the document generator
      document = createTenderingReportPdfDocument({
        generatedAtISO: body.generatedAtISO,
        formData: body.formData,
        result: body.result,
        legalResult: body.legalResult ?? null,
      });
    } catch (docErr: any) {
      if (/Font family not registered/i.test(docErr.message)) {
        // Only retry with bodyFontFamily if the document generator supports it in its typing
        // Otherwise, remove this extra property to avoid type errors
        document = createTenderingReportPdfDocument({
          generatedAtISO: body.generatedAtISO,
          formData: body.formData,
          result: body.result,
          legalResult: body.legalResult ?? null,
          // The next line is commented out to avoid type errors (see lint warning)
          // bodyFontFamily: DEFAULT_BODY_FONT,
        });
      } else {
        throw docErr;
      }
    }

    // Use renderToStream for performance and memory efficiency
    const stream = await renderToStream(document);

    // Buffer the PDF stream
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
    // Log the actual error, including font registration specifics
    console.error('PDF Generation Error:', err?.message, err?.stack);

    // Augment error message if font issue detected
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