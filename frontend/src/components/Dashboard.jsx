import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchTransactions } from '../services/api';

const COLORS = {
  MTN: '#ffbb00',
  TELECEL: '#ff3366',
  AT: '#00e5ff'
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [filterNetwork, setFilterNetwork] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (err) {
        setError(`Failed to load dashboard data. Reason: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Simulate real-time polling every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (filterNetwork === 'ALL') return transactions;
    return transactions.filter(tx => tx.Network.toUpperCase() === filterNetwork);
  }, [transactions, filterNetwork]);

  const metrics = useMemo(() => {
    const defaultMetrics = { total: 0, MTN: 0, TELECEL: 0, AT: 0 };
    if (!filteredTransactions.length) return defaultMetrics;

    return filteredTransactions.reduce((acc, tx) => {
      const amount = parseFloat(tx.Amount) || 0;
      acc.total += amount;
      if (tx.Network && acc[tx.Network] !== undefined) {
        acc[tx.Network] += amount;
      }
      return acc;
    }, { total: 0, MTN: 0, TELECEL: 0, AT: 0 });
  }, [filteredTransactions]);

  const chartData = useMemo(() => [
    { name: 'MTN', value: metrics.MTN },
    { name: 'Telecel', value: metrics.TELECEL },
    { name: 'AT', value: metrics.AT },
  ].filter(d => d.value > 0), [metrics]);

  const dailyData = useMemo(() => {
    const grouped = {};
    filteredTransactions.forEach(tx => {
      const dateStr = new Date(tx.CreatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!grouped[dateStr]) grouped[dateStr] = 0;
      grouped[dateStr] += parseFloat(tx.Amount) || 0;
    });
    return Object.keys(grouped)
      .map(date => ({ date, amount: grouped[date] }))
      .sort((a, b) => new Date(a.date + ' ' + new Date().getFullYear()) - new Date(b.date + ' ' + new Date().getFullYear()));
  }, [filteredTransactions]);

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Network', 'Amount', 'Status', 'Date'];
    const rows = filteredTransactions.map(tx => [
      tx.SK.replace('TX#', ''),
      tx.Network,
      tx.Amount,
      tx.Status,
      new Date(tx.CreatedAt).toISOString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `omnisync_transactions_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center p-16 text-textSecondary text-xl font-light">Loading ledger data...</div>;
  if (error) return <div className="text-center p-16 text-telecel text-lg font-mono">{error}</div>;

  const formatCurrency = (val) => `GHS ${val.toFixed(2)}`;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-8 group">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-textSecondary mb-3">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_var(--tw-colors-success)]"></div>
            <span className="text-success">Total Volume</span>
          </div>
          <div className="text-4xl font-mono font-semibold text-white tracking-tight">{formatCurrency(metrics.total)}</div>
          <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] transition-all duration-700 ease-in-out group-hover:left-[150%]"></div>
        </div>
        
        <div className="glass-card p-8 group">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-textSecondary mb-3">
            <div className="w-2 h-2 rounded-full bg-mtn shadow-glow-mtn"></div>
            <span className="text-mtn">MTN MoMo</span>
          </div>
          <div className="text-4xl font-mono font-semibold text-white tracking-tight">{formatCurrency(metrics.MTN)}</div>
          <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] transition-all duration-700 ease-in-out group-hover:left-[150%]"></div>
        </div>

        <div className="glass-card p-8 group">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-textSecondary mb-3">
            <div className="w-2 h-2 rounded-full bg-telecel shadow-glow-telecel"></div>
            <span className="text-telecel">Telecel Cash</span>
          </div>
          <div className="text-4xl font-mono font-semibold text-white tracking-tight">{formatCurrency(metrics.TELECEL)}</div>
          <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] transition-all duration-700 ease-in-out group-hover:left-[150%]"></div>
        </div>

        <div className="glass-card p-8 group">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-textSecondary mb-3">
            <div className="w-2 h-2 rounded-full bg-at shadow-glow-at"></div>
            <span className="text-at">AT Money</span>
          </div>
          <div className="text-4xl font-mono font-semibold text-white tracking-tight">{formatCurrency(metrics.AT)}</div>
          <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] transition-all duration-700 ease-in-out group-hover:left-[150%]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-8">
        <div className="glass-panel p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <div className="text-2xl font-semibold text-white">Real-Time Feed</div>
            <div className="flex gap-4">
              <select 
                className="bg-bgDeep border border-white/10 text-white rounded-lg px-4 py-2 outline-none focus:border-white/30 text-sm font-medium"
                value={filterNetwork}
                onChange={(e) => setFilterNetwork(e.target.value)}
              >
                <option value="ALL">All Networks</option>
                <option value="MTN">MTN</option>
                <option value="TELECEL">Telecel</option>
                <option value="AT">AT</option>
              </select>
              <button 
                onClick={exportCSV}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-5 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
            {filteredTransactions.map(tx => {
              const netColor = tx.Network.toUpperCase() === 'MTN' ? 'bg-mtn shadow-glow-mtn' : 
                               tx.Network.toUpperCase() === 'TELECEL' ? 'bg-telecel shadow-glow-telecel' : 
                               'bg-at shadow-glow-at';
              return (
                <div key={tx.SK} onClick={() => setSelectedTx(tx)} className="cursor-pointer flex justify-between items-center p-5 bg-tx-default border border-white/5 rounded-2xl transition-all duration-300 ease-in-out hover:bg-tx-hover hover:translate-x-1 hover:border-white/10 relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${netColor}`}></div>
                  <div className="flex flex-col gap-1 pl-2">
                    <span className="font-mono font-medium text-[1.10rem] text-white tracking-wider">{tx.SK.replace('TX#', '')}</span>
                    <span className="text-textSecondary text-sm font-light">{new Date(tx.CreatedAt).toLocaleString()}</span>
                  </div>
                  <div className="font-mono font-semibold text-xl text-white drop-shadow-md">
                    + {formatCurrency(parseFloat(tx.Amount))}
                  </div>
                </div>
              )
            })}
            {filteredTransactions.length === 0 && (
              <div className="text-textSecondary text-center p-8">No transactions match your filter.</div>
            )}
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col">
          <div className="text-2xl font-semibold text-white mb-8 border-b border-white/10 pb-4">Network Distribution</div>
          <div className="h-[350px] w-full flex justify-center items-center mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name.toUpperCase()]} style={{ filter: `drop-shadow(0px 0px 10px ${COLORS[entry.name.toUpperCase()]})` }} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 20, 0.95)', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="text-textSecondary text-center pt-16">No data to display.</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 flex flex-col">
        <div className="text-2xl font-semibold text-white mb-8 border-b border-white/10 pb-4">Daily Volume Trend</div>
        <div className="h-[300px] w-full mt-4">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `GHS ${val}`} dx={-10} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 20, 0.95)', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 600 }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-textSecondary text-center pt-16">No daily data to display.</div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedTx(null)}>
          <div className="glass-panel max-w-2xl w-full p-8 relative flex flex-col gap-6 animate-[slideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-textSecondary hover:text-white transition-colors p-2"
              onClick={() => setSelectedTx(null)}
            >
              ✕
            </button>
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-semibold text-white">Transaction Details</h2>
              <p className="text-textSecondary text-sm mt-1">{selectedTx.SK.replace('TX#', '')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-textSecondary uppercase text-xs font-semibold tracking-wider">Network</span>
                <span className="text-white font-medium">{selectedTx.Network}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-textSecondary uppercase text-xs font-semibold tracking-wider">Amount</span>
                <span className="text-white font-medium font-mono">{formatCurrency(parseFloat(selectedTx.Amount))}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-textSecondary uppercase text-xs font-semibold tracking-wider">Status</span>
                <span className="text-success font-medium">{selectedTx.Status}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-textSecondary uppercase text-xs font-semibold tracking-wider">Date</span>
                <span className="text-white font-medium">{new Date(selectedTx.CreatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-textSecondary uppercase text-xs font-semibold tracking-wider">Raw Webhook Payload</span>
              <div className="bg-bgDeep border border-white/5 p-4 rounded-xl overflow-x-auto custom-scrollbar">
                <pre className="text-xs text-[#a8b2d1] font-mono leading-relaxed">
                  {selectedTx.RawPayload 
                    ? (() => {
                        try { return JSON.stringify(JSON.parse(selectedTx.RawPayload), null, 2) } 
                        catch { return selectedTx.RawPayload }
                      })()
                    : 'No raw payload available'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
