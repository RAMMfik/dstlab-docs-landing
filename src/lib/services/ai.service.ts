import { analyzeDocument } from "@/lib/ai";

export async function runDocumentAnalysis(text: string) {
  return analyzeDocument(text);
}