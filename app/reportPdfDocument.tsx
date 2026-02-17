import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { AnalysisResult, LegalComplianceResult, ProcurementData } from '../types';

// Use built-in PDF fonts only (always available)
const PDF_FONT_FAMILY = 'Helvetica';

type Props = {
  generatedAtISO: string;
  formData: ProcurementData;
  result: AnalysisResult;
  legalResult: LegalComplianceResult | null;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 28,
    fontSize: 10,
    fontFamily: PDF_FONT_FAMILY,
    color: '#0f172a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: '#B51D4E',
  },
  meta: {
    fontSize: 9,
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#334155',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  lead: {
    fontSize: 11,
    lineHeight: 1.35,
    marginBottom: 6,
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  statLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: '#64748b',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  statValueAccent: {
    color: '#B51D4E',
  },
  small: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.35,
  },
  listItem: {
    marginBottom: 6,
  },
  listBulletRow: {
    flexDirection: 'row',
  },
  bullet: {
    width: 10,
    color: '#B51D4E',
    fontWeight: 700,
  },
  listBody: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  pill: {
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#334155',
    backgroundColor: '#f8fafc',
  },
  pillHigh: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
  },
  pillMed: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    color: '#92400e',
  },
  pillLow: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    color: '#166534',
  },
});

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('sr-ME');
  } catch {
    return iso;
  }
}

function severityPillStyle(sev: string | undefined) {
  if (sev === 'high') return styles.pillHigh;
  if (sev === 'medium') return styles.pillMed;
  return styles.pillLow;
}

function formatPriceAssessment(value: unknown) {
  const s = String(value ?? '');
  return s.replace(/_/g, ' ').trim();
}

export function createTenderingReportPdfDocument({
  generatedAtISO,
  formData,
  result,
  legalResult,
}: Props) {
  const generatedAt = formatDateTime(generatedAtISO);

  return (
    <Document
      title={`Tendering izvještaj (${generatedAt})`}
      author="Tendering"
      subject="Forenzički izvještaj nabavke"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>
            TENDER<Text style={styles.brandAccent}>ING</Text>
          </Text>
          <Text style={styles.meta}>Generisano: {generatedAt}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sažetak</Text>
          <Text style={styles.lead}>
            {result.conclusion}. Indeks rizika: {Math.round(result.probability)}%.
          </Text>

          <View style={styles.row2}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Indeks rizika</Text>
              <Text style={[styles.statValue, styles.statValueAccent]}>
                {Math.round(result.probability)}%
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Procjena cijene</Text>
              <Text style={[styles.statValue, { fontSize: 12, lineHeight: 1.15 }]} wrap>
                {formatPriceAssessment(result.priceAssessment)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ulazni podaci</Text>
          <Text style={styles.small}>
            Procijenjena vrijednost: {Number(formData.price || 0).toLocaleString()} {formData.currency}
          </Text>
          <View style={{ height: 6 }} />
          {formData.specification.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <View style={styles.listBulletRow}>
                <Text style={styles.bullet}>•</Text>
                <View style={styles.listBody}>
                  <Text style={{ fontSize: 10, fontWeight: 700 }}>
                    {item.description || `Stavka #${idx + 1}`}
                  </Text>
                  {!!item.characteristics && <Text style={styles.small}>{item.characteristics}</Text>}
                  {!!item.quantity && <Text style={styles.small}>Količina: {item.quantity}</Text>}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tržišna analiza</Text>
          <Text style={styles.small}>{result.marketValueEstimate}</Text>
          <View style={{ height: 8 }} />
          <View style={styles.row2}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>AI tržišna cijena</Text>
              <Text style={styles.statValue}>
                {Number(result.savings?.estimatedMarketPrice || 0).toLocaleString()} EUR
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Razlika</Text>
              <Text style={styles.statValue}>
                {Number(result.savings?.differenceAmount || 0).toLocaleString()} EUR
              </Text>
              <Text style={styles.small}>
                {Number(result.savings?.differencePercentage || 0)}% iznad tržišta
              </Text>
            </View>
          </View>
          {!!result.savings?.socialImpactDescription && (
            <>
              <View style={{ height: 8 }} />
              <Text style={styles.small}>Društveni uticaj: {result.savings.socialImpactDescription}</Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Signali rizika (sve otvoreno)</Text>
          {result.redFlags?.length ? (
            result.redFlags.map((flag, idx) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                <View style={styles.pillRow}>
                  <Text style={[styles.pill, severityPillStyle(flag.severity)]}>
                    {flag.severity === 'high'
                      ? 'Kritično'
                      : flag.severity === 'medium'
                        ? 'Umjereno'
                        : 'Nisko'}
                  </Text>
                  <Text style={styles.pill}>Signal #{idx + 1}</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>
                  {flag.description}
                </Text>
                <Text style={styles.small}>{flag.explanation}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.small}>Nema detektovanih signala rizika.</Text>
          )}
        </View>

        {legalResult && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pravna analiza (sve otvoreno)</Text>
            <Text style={styles.small}>{legalResult.summary}</Text>
            <View style={{ height: 8 }} />
            <Text style={styles.small}>Score: {Number(legalResult.overallComplianceScore || 0)}/100</Text>
            <View style={{ height: 8 }} />
            {legalResult.violations?.length ? (
              legalResult.violations.map((v, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <View style={styles.pillRow}>
                    <Text style={styles.pill}>{v.article}</Text>
                    <Text style={styles.pill}>{v.principle}</Text>
                  </View>
                  <Text style={styles.small}>{v.description}</Text>
                  <Text style={[styles.small, { color: '#64748b' }]}>{v.cautionaryNote}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.small}>Nema navedenih potencijalnih povreda.</Text>
            )}
            <View style={{ height: 6 }} />
            <Text style={styles.small}>{legalResult.guidelineCompliance}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export function TenderingReportPdfDocument(props: Props) {
  return createTenderingReportPdfDocument(props);
}