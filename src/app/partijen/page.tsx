import AppShell from "../AppShell";
import MotionBrowser from "../MotionBrowser";
import PartySimilarity from "../PartySimilarity";
import PartySpectrumPage from "./spectrum/PartySpectrumPage";

export default function PartiesPage() {
  return <AppShell activePath="/partijen">
    <MotionBrowser showMotionModule={false} />
    <PartySpectrumPage />
    <PartySimilarity />
  </AppShell>;
}
