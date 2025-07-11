// 'use server';

/**
 * @fileOverview Analyzes waste data and provides waste reduction recommendations.
 *
 * - analyzeWasteData - A function that handles the waste data analysis process.
 * - AnalyzeWasteDataInput - The input type for the analyzeWasteData function.
 * - AnalyzeWasteDataOutput - The return type for the analyzeWasteData function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWasteDataInputSchema = z.object({
  wasteData: z
    .string()
    .describe(
      'A CSV file containing waste data. Columns should include waste type and quantity.'
    ),
});
export type AnalyzeWasteDataInput = z.infer<typeof AnalyzeWasteDataInputSchema>;

const AnalyzeWasteDataOutputSchema = z.object({
  summary: z.string().describe('A summary of the waste data analysis.'),
  recommendations: z
    .string()
    .describe(
      'Specific recommendations for waste reduction, including potential areas of improvement.'
    ),
});
export type AnalyzeWasteDataOutput = z.infer<typeof AnalyzeWasteDataOutputSchema>;

export async function analyzeWasteData(input: AnalyzeWasteDataInput): Promise<AnalyzeWasteDataOutput> {
  return analyzeWasteDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWasteDataPrompt',
  input: {schema: AnalyzeWasteDataInputSchema},
  output: {schema: AnalyzeWasteDataOutputSchema},
  prompt: `You are an AI-powered waste management assistant. Analyze the provided waste data and provide actionable recommendations for waste reduction.

Waste Data: {{{wasteData}}}

Respond with a summary of the waste data and specific recommendations for waste reduction.
`,
});

const analyzeWasteDataFlow = ai.defineFlow(
  {
    name: 'analyzeWasteDataFlow',
    inputSchema: AnalyzeWasteDataInputSchema,
    outputSchema: AnalyzeWasteDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
