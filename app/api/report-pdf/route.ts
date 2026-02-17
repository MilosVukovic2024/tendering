import { NextResponse } from 'next/server';
import { renderToBuffer, Font } from '@react-pdf/renderer';

import type { AnalysisResult, LegalComplianceResult, ProcurementData } from '../../../types';
import { createTenderingReportPdfDocument } from '../../reportPdfDocument';

export const runtime = 'nodejs';

// Register the custom font 'TenderingBody' if not already registered
// Point this to the path of your font file - adjust as needed!

// Register Inter with direct links to the font files
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 300 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

type Body = {
  generatedAtISO: string;
  formData: ProcurementData;
  result: AnalysisResult;
  legalResult: LegalComplianceResult | null;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Minimal validation to avoid runtime crashes
  if (!body?.generatedAtISO || !body?.formData || !body?.result) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const document = createTenderingReportPdfDocument({
    generatedAtISO: body.generatedAtISO,
    formData: body.formData,
    result: body.result,
    legalResult: body.legalResult ?? null,
  });

  try {
    const buf = await renderToBuffer(document);
    const bytes = new Uint8Array(buf);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="tendering_izvjestaj.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('report-pdf generation failed', err);
    return NextResponse.json({ error: 'PDF generation failed - font not registered or generation failed' }, { status: 500 });
  }
}
