import React from "react";
import { A2UIComponent } from "@/types/a2ui";
import { A2UIRenderer } from "../A2UIRenderer";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  GaugeChart // Note: Using a custom implementation for Gauge as Recharts doesn't have a direct one
} from "recharts";

interface CardProps {
  component: A2UIComponent;
  onAction: (
    componentId: string,
    action: string,
    data?: Record<string, any>
  ) => void;
  dataModel: Record<string, any>;
}

export const Card: React.FC<CardProps> = ({
  component,
  onAction,
  dataModel,
}) => {
  const { title, data, chartType } = component.properties || {};
  const children = component.children || [];

  const renderChart = () => {
    if (!data || !chartType) return null;

    switch (chartType) {
      case "bar-chart":
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryKey" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valueKey" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "pie-chart":
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case "line-chart":
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="xKey" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="yKey1" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "metric-cards":
        return (
          <div className="grid grid-cols-2 gap-4">
            {data.map((metric: any, idx: number) => (
              <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase font-medium">{metric.label}</p>
                <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                {metric.change && (
                  <p className={`text-xs ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      case "lifecycle-phase-cards":
        return (
          <div className="space-y-4">
            {data.map((phase: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg" style={{ borderLeftColor: phase.color, borderLeftWidth: '4px' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{phase.phase}</h4>
                    <p className="text-xs text-gray-500">{phase.timeline}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    phase.severity === 'high' ? 'bg-red-100 text-red-800' :
                    phase.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                    phase.severity === 'low' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {phase.severity}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Assets:</span> <span>{phase.count}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Carbon:</span> <span>{phase.metrics.carbon_emission || phase.metrics.carbon}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Energy:</span> <span>{phase.metrics.energy_consumption || phase.metrics.energy}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Savings:</span> <span className="text-green-600">-{phase.metrics.carbon_savings || phase.metrics.savings_carbon}</span></div>
                </div>
              </div>
            ))}
          </div>
        );
      case "table":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {component.properties.columns?.map((col: string, idx: number) => (
                    <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row: any[], rowIdx: number) => (
                  <tr key={rowIdx}>
                    {row.map((cell: any, cellIdx: number) => (
                      <td key={cellIdx} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div className="text-sm text-gray-500 italic">Unsupported chart type: {chartType}</div>;
    }
  };

  const action = component.properties?.action;

  const handleClick = () => {
    if (action) {
      onAction(component.id, action, component.properties);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4 ${action ? 'cursor-pointer hover:border-blue-400 transition-colors' : ''}`}
      onClick={handleClick}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4 space-y-4">
        {renderChart()}
        {children.map((childId: string) => (
          <A2UIRenderer
            key={childId}
            componentId={childId}
            onAction={onAction}
            dataModel={dataModel}
          />
        ))}
      </div>
    </div>
  );
};
