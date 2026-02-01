import { getCaseById } from "@/data/cases";
import { GameShell } from "@/components/GameShell";
import { notFound } from "next/navigation";

export default async function CasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseData = getCaseById(caseId);
  if (!caseData) notFound();

  return <GameShell caseData={caseData} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseData = getCaseById(caseId);
  return {
    title: caseData ? `Case: ${caseData.title} — SQL Police` : "Case Not Found",
  };
}
