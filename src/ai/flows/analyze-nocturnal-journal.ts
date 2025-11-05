// src/ai/flows/analyze-nocturnal-journal.ts
'use server';
/**
 * @fileOverview Analyzes nocturnal journal entries to identify trends.
 *
 * - analyzeNocturnalJournal - A function that analyzes journal entries.
 * - AnalyzeNocturnalJournalInput - The input type for the analyzeNocturnalJournal function.
 * - AnalyzeNocturnalJournalOutput - The return type for the analyzeNocturnalJournal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeNocturnalJournalInputSchema = z.object({
  journalEntries: z.array(z.string()).describe('An array of journal entries to analyze.'),
});
export type AnalyzeNocturnalJournalInput = z.infer<typeof AnalyzeNocturnalJournalInputSchema>;

const AnalyzeNocturnalJournalOutputSchema = z.object({
  trendAnalysis: z
    .string()
    .describe(
      'A summary of trends (positive/negative) based on keywords or repeated topics that emerge over time.'
    ),
});
export type AnalyzeNocturnalJournalOutput = z.infer<typeof AnalyzeNocturnalJournalOutputSchema>;

export async function analyzeNocturnalJournal(
  input: AnalyzeNocturnalJournalInput
): Promise<AnalyzeNocturnalJournalOutput> {
  return analyzeNocturnalJournalFlow(input);
}

const analyzeJournalPrompt = ai.definePrompt({
  name: 'analyzeJournalPrompt',
  input: {schema: AnalyzeNocturnalJournalInputSchema},
  output: {schema: AnalyzeNocturnalJournalOutputSchema},
  prompt: `You are an AI assistant that analyzes a user's nocturnal journal entries and identifies trends.

  Analyze the following journal entries and provide a summary of trends (positive/negative) based on keywords or repeated topics that emerge over time, helping the user derive insight from their journal.
  Journal Entries:
  {{#each journalEntries}}
  - {{{this}}}
  {{/each}}`,
});

const analyzeNocturnalJournalFlow = ai.defineFlow(
  {
    name: 'analyzeNocturnalJournalFlow',
    inputSchema: AnalyzeNocturnalJournalInputSchema,
    outputSchema: AnalyzeNocturnalJournalOutputSchema,
  },
  async input => {
    const {output} = await analyzeJournalPrompt(input);
    return output!;
  }
);
