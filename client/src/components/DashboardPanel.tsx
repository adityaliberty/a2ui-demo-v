import React from "react";
import { AlertCircle, Zap, Leaf, TrendingDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardPanelProps {
  data: any;
  onClose?: () => void;
}

interface PhaseCardProps {
  phase: string;
  count: number;
  timeline: string;
  color: string;
  severity: string;
  carbonSavings: number;
  energySavings: number;
  withUpgrade: number;
  onAction: () => void;
}

/**
 * Individual Lifecycle Phase Card Component
 */
const LifecyclePhaseCard: React.FC<PhaseCardProps> = ({
  phase,
  count,
  timeline,
  color,
  severity,
  carbonSavings,
  energySavings,
  withUpgrade,
  onAction,
}) => {
  const getSeverityIcon = () => {
    switch (severity) {
      case "high":
        return "🔴";
      case "medium":
        return "🟠";
      case "low":
        return "🟢";
      default:
        return "🔵";
    }
  };

  const getSeverityLabel = () => {
    switch (severity) {
      case "high":
        return "Critical";
      case "medium":
        return "Important";
      case "low":
        return "Monitor";
      default:
        return "Track";
    }
  };

  const getButtonConfig = () => {
    if (phase === "Immediate" || phase === "Strategic Planning") {
      return {
        label: "Refresh Assets",
        icon: <TrendingDown className="w-4 h-4 mr-2" />,
      };
    }
    return {
      label: "Remind Me",
      icon: <Bell className="w-4 h-4 mr-2" />,
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4"
      style={{ borderLeftColor: color, backgroundColor: "#ffffff" }}
    >
      {/* Card Header with Color Bar */}
      <div className="h-2" style={{ backgroundColor: color }} />

      {/* Card Content */}
      <div className="p-6">
        {/* Top Section: Title and Icon */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{phase}</h3>
            <p className="text-sm text-gray-600 mt-1">{timeline}</p>
          </div>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md"
            style={{ backgroundColor: color }}
          >
            {getSeverityIcon()}
          </div>
        </div>

        {/* Asset Count */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold">
            Assets
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
          <p className="text-xs text-gray-500 mt-1">
            {withUpgrade} with upgrade path
          </p>
        </div>

        {/* Carbon Savings */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700 uppercase font-semibold">
              Carbon Savings Potential
            </p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {carbonSavings.toFixed(2)} tCO2e
          </p>
          <p className="text-xs text-green-600 mt-1">
            After replacing {withUpgrade} assets
          </p>
        </div>

        {/* Energy Savings */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-700 uppercase font-semibold">
              Energy Savings
            </p>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {energySavings.toFixed(0)} kWh/year
          </p>
        </div>

        {/* Severity Badge */}
        <div
          className="mb-4 flex items-center gap-2 p-2 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <AlertCircle className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-semibold" style={{ color }}>
            {getSeverityLabel()} Priority
          </span>
        </div>

        {/* Action Button */}
        <Button
          onClick={onAction}
          className="w-full font-semibold py-2 rounded-lg transition-all duration-200 text-white"
          style={{
            backgroundColor: color,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {buttonConfig.icon}
          {buttonConfig.label}
        </Button>
      </div>
    </div>
  );
};

const DashboardPanel: React.FC<DashboardPanelProps> = ({ data, onClose }) => {
  if (!data) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Dashboard Ready
          </h3>
          <p className="text-gray-600 text-sm">
            Send a message to analyze your IT assets
          </p>
        </div>
      </div>
    );
  }

  const phases = data.phases || [];

  const handleAction = (phase: string) => {
    console.log(`Action clicked for ${phase}`);
    switch (phase) {
      case "Immediate":
        alert(`Initiating IMMEDIATE asset refresh for ${phase} assets...`);
        break;
      case "Strategic Planning":
        alert(`Developing STRATEGIC refresh plan for ${phase} assets...`);
        break;
      case "Future Planning":
        alert(`Setting reminder for FUTURE planning phase...`);
        break;
      case "Long-term Monitoring":
        alert(`Setting reminder for LONG-TERM monitoring phase...`);
        break;
      default:
        alert(`Action for ${phase} assets...`);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="space-y-6">
        {/* Dashboard Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Asset Lifecycle Phases
          </h2>
          <p className="text-gray-600 text-sm">
            Plan your IT asset refresh strategy based on end-of-support dates
            and carbon impact
          </p>
        </div>

        {/* Summary Stats */}
        {data.metrics && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">
                Total Assets
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.metrics["Total Assets"] || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">
                Potential Savings
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {data.metrics["Potential Savings"] || "0 tCO2e"}
              </p>
            </div>
          </div>
        )}

        {/* 4 Lifecycle Phase Cards */}
        <div className="grid grid-cols-1 gap-6">
          {phases.map((phase: any, idx: number) => (
            <LifecyclePhaseCard
              key={idx}
              phase={phase.phase}
              count={phase.count}
              timeline={phase.timeline}
              color={phase.color}
              severity={phase.severity}
              carbonSavings={phase.metrics?.savings_carbon || 0}
              energySavings={phase.metrics?.savings_energy || 0}
              withUpgrade={phase.metrics?.with_upgrade || 0}
              onAction={() => handleAction(phase.phase)}
            />
          ))}
        </div>

        {/* Alert Section */}
        {phases.some((p: any) => p.severity === "high") && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 text-sm">
                  Immediate Action Required
                </h4>
                <p className="text-red-700 text-xs mt-1">
                  {phases.find((p: any) => p.severity === "high")?.count} assets
                  require immediate attention within 0-90 days to end of
                  support. Plan replacements now to avoid service disruptions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Click "Refresh Assets" or "Remind Me" on
            any card to manage that lifecycle phase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
