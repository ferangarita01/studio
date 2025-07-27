'use server';

/**
 * @fileOverview Analyzes waste data and provides waste reduction recommendations.
 *
 * - analyzeWasteData - A function that handles the waste data analysis process.
 * - AnalyzeWasteDataInput - The input type for the analyzeWasteData function.
 * - AnalyzeWasteDataOutput - The return type for the analyzeWasteData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getWasteLog as getWasteLogService } from '@/services/waste-data-service';

const getWasteLog = ai.defineTool(
  {
    name: 'getWasteLog',
    description: 'Returns the full log of waste entries.',
    inputSchema: z.undefined(),
    outputSchema: z.any(),
  },
  async () => {
    // This is a simplification. In a real app, you'd pass the companyId.
    const log = await getWasteLogService();
    // Convert to CSV for the prompt
    if (log.length === 0) {
      return "No waste data found.";
    }
    const headers = "Waste Type,Quantity (kg)";
    const rows = log.map(entry => `${entry.type},${entry.quantity}`);
    return `${headers}\n${rows.join('\n')}`;
  }
)


const AnalyzeWasteDataInputSchema = z.object({
  wasteData: z
    .string()
    .describe(
      'A CSV file containing waste data. Columns should include waste type and quantity. If this is empty, use the getWasteLog tool to fetch the data.'
    ),
  lang: z.enum(['en', 'es']).describe('The language for the response.'),
});
export type AnalyzeWasteDataInput = z.infer<typeof AnalyzeWasteDataInputSchema>;

const AnalyzeWasteDataOutputSchema = z.object({
  summary: z.string().describe('A summary of the waste data analysis.'),
  recommendations: z
    .string()
    .describe(
      'Specific recommendations for waste reduction, including potential areas of improvement.'
    ),
  carbonFootprint: z.number().describe('Estimated carbon footprint reduction in kg of CO2 equivalent based on the amount of recycling. For every 1kg of recycling, assume a reduction of 1kg of CO2.'),
  chartData: z.array(z.object({
    name: z.string().describe("The name of the waste type (e.g., Recycling, Organic)."),
    total: z.number().describe("The total quantity in kg for that waste type."),
  })).describe("An array of objects representing the total waste quantity for each type, suitable for charting."),
});
export type AnalyzeWasteDataOutput = z.infer<typeof AnalyzeWasteDataOutputSchema>;

export async function analyzeWasteData(input: AnalyzeWasteDataInput): Promise<AnalyzeWasteDataOutput> {
  return analyzeWasteDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWasteDataPrompt',
  input: {schema: AnalyzeWasteDataInputSchema},
  output: {schema: AnalyzeWasteDataOutputSchema},
  tools: [getWasteLog],
  prompt: `You are an AI-powered waste management assistant. You must respond in the following language: {{{lang}}}.
  
Analyze the provided waste data and provide actionable recommendations for waste reduction.
If the user has not provided waste data, you MUST use the getWasteLog tool to get the full history of waste entries.

Waste Data: {{{wasteData}}}

First, parse the CSV data. It has "Waste Type" and "Quantity (kg)" columns. 
Calculate the total quantity for each distinct waste type (Recycling, Organic, General, Hazardous, etc.).
Populate the chartData array with an object for each waste type, containing its name and the calculated total quantity.

Also, calculate the carbon footprint reduction. For every 1kg of "Recycling" waste, assume a reduction of 1kg of CO2 equivalent. Sum up all recycling quantities to get the total and set the carbonFootprint field.

Finally, respond with a summary of the waste data, specific recommendations for waste reduction, the calculated carbon footprint, and the structured chart data.
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

    