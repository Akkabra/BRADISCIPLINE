// src/app/actions.ts
'use server';

import { analyzeNocturnalJournal } from '@/ai/flows/analyze-nocturnal-journal';
import { generateQuote } from '@/ai/flows/generate-quote-flow';
import { z } from 'zod';

const JournalAnalysisInput = z.object({
  entries: z.array(z.string()),
});

export async function getJournalAnalysis(formData: FormData) {
  const rawEntries = formData.get('entries');
  if (typeof rawEntries !== 'string') {
    return { error: 'Invalid input format.' };
  }

  const parsed = JournalAnalysisInput.safeParse({
    entries: JSON.parse(rawEntries),
  });

  if (!parsed.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await analyzeNocturnalJournal({ journalEntries: parsed.data.entries });
    return { analysis: result.trendAnalysis };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to analyze journal entries.' };
  }
}

export async function getAIQuote() {
  try {
    const result = await generateQuote();
    return { quote: result.quote };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate quote.' };
  }
}
