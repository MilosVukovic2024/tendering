import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import type { AnalysisResult, LegalComplianceResult, ProcurementData } from '../../../types';
import { createTenderingReportPdfDocument } from '../../reportPdfDocument';

export const runtime = 'nodejs';

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
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}

