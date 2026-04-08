import { analyzeDocument, analyzeDocumentDetailed } from "@/lib/ai";

export async function runDocumentAnalysisDetailed(text: string) {
  return analyzeDocumentDetailed(text);
}

export async function runDocumentAnalysis(text: string) {
  return analyzeDocument(text);
}