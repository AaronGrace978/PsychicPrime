import { useStore } from "../store";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import GateBanner from "./GateBanner";
import PhoneDock from "./PhoneDock";
import ChamberPanel from "./ChamberPanel";
import SpreadPanel from "./SpreadPanel";
import OraclePanel from "./OraclePanel";
import SolomonPanel from "./SolomonPanel";
import TestimonyPanel from "./TestimonyPanel";
import SignalLabPanel from "./SignalLabPanel";
import RelicsPanel from "./RelicsPanel";
import ConstellationPanel from "./ConstellationPanel";
import SeekersPanel from "./SeekersPanel";
import CalibrationPanel from "./CalibrationPanel";
import RulePanel from "./RulePanel";
import SettingsPanel from "./SettingsPanel";
import type { ModuleId } from "../types";

const PANELS: Record<ModuleId, React.ComponentType> = {
  chamber: ChamberPanel,
  spreads: SpreadPanel,
  oracle: OraclePanel,
  solomon: SolomonPanel,
  testimony: TestimonyPanel,
  signals: SignalLabPanel,
  relics: RelicsPanel,
  constellation: ConstellationPanel,
  seekers: SeekersPanel,
  calibration: CalibrationPanel,
  rule: RulePanel,
  settings: SettingsPanel,
};

export default function Console() {
  const moduleId = useStore((s) => s.module);
  const Panel = PANELS[moduleId];

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <GateBanner />
        <TopBar />
        <div className="content">
          <Panel />
        </div>
      </main>
      <PhoneDock />
    </div>
  );
}
