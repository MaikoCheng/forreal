import AppShell from "../AppShell";
import CabinetAnalysis from "../CabinetAnalysis";
import CommitmentsBrowser from "../CommitmentsBrowser";

export default function CommitmentsPage() {
  return <AppShell activePath="/kabinet"><CabinetAnalysis /><CommitmentsBrowser /></AppShell>;
}
