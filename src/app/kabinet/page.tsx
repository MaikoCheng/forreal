import AppShell from "../AppShell";
import CabinetAnalysis from "../CabinetAnalysis";
import CommitmentsBrowser from "../CommitmentsBrowser";

export default function CabinetPage() {
  return <AppShell activePath="/kabinet"><CabinetAnalysis /><CommitmentsBrowser /></AppShell>;
}
