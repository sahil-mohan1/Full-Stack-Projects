import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  headers: { key: string; label: string }[];
  filename: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, headers, filename }) => {
  const exportToCSV = () => {
    if (data.length === 0) {
      alert('No data available to export.');
      return;
    }

    // Prepare CSV header row
    const csvHeaders = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
    
    // Prepare CSV content rows
    const csvRows = data.map(row => {
      return headers.map(h => {
        const val = row[h.key];
        const valStr = val === undefined || val === null ? '' : String(val);
        return `"${valStr.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-xs font-semibold text-slate-350 hover:text-slate-200 transition-all shadow-md"
    >
      <Download className="w-4 h-4 text-emerald-400" />
      <span>Export CSV Report</span>
    </button>
  );
};
