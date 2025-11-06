'use server';
/**
 * @fileOverview Generates a motivational quote.
 *
 * - generateQuote - A function that generates a motivational quote.
 * - GenerateQuoteOutput - The return type for the generateQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuoteOutputSchema = z.object({
  quote: z.string().describe('A short, powerful motivational quote about discipline, self-control, or purpose.'),
});
export type GenerateQuoteOutput = z.infer<typeof GenerateQuoteOutputSchema>;

export async function generateQuote(): Promise<GenerateQuoteOutput> {
  return generateQuoteFlow();
}

const generateQuotePrompt = ai.definePrompt({
  name: 'generateQuotePrompt',
  output: {schema: GenerateQuoteOutputSchema},
  prompt: `You are a stoic philosopher and a drill sergeant. Generate a single, short, powerful, and original motivational quote about discipline, self-control, or conquering oneself. The quote should be in Spanish. Do not use quotation marks.`,
});

const generateQuoteFlow = ai.defineFlow(
  {
    name: 'generateQuoteFlow',
    outputSchema: GenerateQuoteOutputSchema,
  },
  async () => {
    const {output} = await generateQuotePrompt();
    return output!;
  }
);
