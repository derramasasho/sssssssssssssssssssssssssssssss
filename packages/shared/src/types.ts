import { z } from 'zod';

export const swapRequestSchema = z.object({
  fromToken: z.string(),
  toToken: z.string(),
  amount: z.string(),
});

export type SwapRequest = z.infer<typeof swapRequestSchema>;