import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Building2, Briefcase, Banknote } from 'lucide-react';

export const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/reports/summary');
      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reports...</div>;
  if (!data) return <div>Failed to load reports.</div>;

  const statCards = [
    { title: 'Total Employees', value: data.headcount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Departments', value: data.departments, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Open Jobs', value: data.active_jobs, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Current Month Payroll', value: `$${Number(data.total_payroll).toLocaleString()}`, icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Reports Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Employees by Department</h2>
          <div className="space-y-4">
            {data.department_distribution.map((dept, i) => {
              const maxCount = Math.max(...data.department_distribution.map(d => d.count || 0), 1);
              const percentage = ((dept.count || 0) / maxCount) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{dept.name}</span>
                    <span className="text-gray-500">{dept.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Insights</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span> 
              The organization currently has a total headcount of {data.headcount} across {data.departments} departments.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span> 
              There are {data.active_jobs} open job requisitions actively seeking candidates.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span> 
              Total payroll processed for the current month is ${Number(data.total_payroll).toLocaleString()}.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span> 
              Largest department by headcount is {data.department_distribution.length > 0 ? [...data.department_distribution].sort((a,b) => b.count - a.count)[0].name : 'N/A'}.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
