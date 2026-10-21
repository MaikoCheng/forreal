import AppShell from "../AppShell";
import MotionBrowser from "../MotionBrowser";

export default function MotionsPage() {
  return <AppShell activePath="/moties"><MotionBrowser showPartyModule={false} /></AppShell>;
}
