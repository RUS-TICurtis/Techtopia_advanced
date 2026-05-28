import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import { 
  BarChart3, FileText, Upload, Sparkles, CheckCircle2, 
  TrendingUp, Activity, HardDrive, AlertTriangle, ShieldCheck,
  RefreshCw, FileCheck
} from 'lucide-react';
import './ExecutiveIntelligence.css';

export default function ExecutiveIntelligence() {
  const [healthScores] = useState([
    { id: 'h1', name: 'CloudScale Inc.', category: 'Customer', score: 92, status: 'STABLE', tickets: 0, billingDelay: '0 days', risk: 'LOW' },
    { id: 'h2', name: 'BioGen Lab', category: 'Customer', score: 88, status: 'GROWING', tickets: 1, billingDelay: '0 days', risk: 'LOW' },
    { id: 'h3', name: 'CyberPulse Security', category: 'Customer', score: 95, status: 'EXPANDING', tickets: 0, billingDelay: '0 days', risk: 'LOW' },
    { id: 'h4', name: 'DevFlow.io', category: 'Prospect', score: 72, status: 'NURTURE', tickets: 2, billingDelay: '5 days', risk: 'MEDIUM' },
    { id: 'h5', name: 'Roma Tech', category: 'Customer', score: 34, status: 'AT RISK', tickets: 4, billingDelay: '27 days', risk: 'HIGH CHURN' }
  ]);

  // OCR Upload States
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSimulateScan = () => {
    setSelectedFile('Enterprise_SLA_Agreement_CloudScale.pdf');
    setIsScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScannedResult({
        company: 'CloudScale Inc. (HQ)',
        agreementType: 'Enterprise SLA & License Agreement',
        contractValue: '$45,000 / year',
        effectiveDate: '22026-06-01',
        renewalDate: '2027-06-01',
        slaBreachThreshold: '2.0 Hours Response (High-Priority)',
        aiAssessedRisk: 'LOW - Fully backed by SOC2 compliance certificates',
        extractedTokens: 1482
      });
    }, 2000);
  };

  return (
    <PageContainer className="executive-intelligence-page">
      <PageHeader 
        title="Revenue & Document Intelligence"
        subtitle="Predictive financial forecasting, client health index maps, and AI-powered optical contract parsers"
        icon={<BarChart3 className="text-[#01FDF6]" />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-grow min-h-0">
        
        {/* Panel 1: Health Index Matrix & Svg Chart */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* SVG Forecasting Chart */}
          <div className="card bg-gray-900/35 border border-gray-850 p-4 rounded-xl">
            <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#01FDF6]" /> Executive Revenue Forecasting (Q3 - Q4)
            </h4>
            
            <div className="svg-forecast-wrapper h-44 bg-gray-950/40 rounded-xl border border-gray-900 p-3 relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 400 120" className="w-full h-full">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#01FDF6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#01FDF6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="areaWorst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5555" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ff5555" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid lines */}
                <line x1="20" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="20" y1="60" x2="380" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="20" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                
                {/* Worst Case Forecast */}
                <path d="M 20 100 Q 100 90 200 85 T 380 75" fill="none" stroke="#ff5555" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 20 100 Q 100 90 200 85 T 380 75 L 380 110 L 20 110 Z" fill="url(#areaWorst)" />

                {/* Optimistic Forecast */}
                <path d="M 20 100 Q 100 70 200 55 T 380 25" fill="none" stroke="#01FDF6" strokeWidth="2.5" className="stroke-glow" />
                <path d="M 20 100 Q 100 70 200 55 T 380 25 L 380 110 L 20 110 Z" fill="url(#areaGrad)" />
                
                {/* Labels */}
                <text x="25" y="115" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">Q1 ACTUAL</text>
                <text x="185" y="115" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">Q3 PREDICTED</text>
                <text x="325" y="115" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">Q4 TARGET</text>
              </svg>
            </div>
          </div>

          {/* Health Index Matrix Table */}
          <div className="card bg-gray-900/35 border border-gray-850 rounded-xl overflow-hidden flex-grow">
            <div className="p-4 border-b border-gray-850 bg-gray-950/20">
              <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-[#bd93f9]" /> Client Health Index Scoring
              </h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="health-table w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-500 font-semibold bg-gray-950/20">
                    <th className="p-3">Client Entity</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Score Index</th>
                    <th className="p-3">Operating Status</th>
                    <th className="p-3 text-center">Tickets Open</th>
                    <th className="p-3">Billing Delay</th>
                    <th className="p-3 text-right">Risk Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {healthScores.map(c => (
                    <tr key={c.id} className="border-b border-gray-950 hover:bg-gray-900/20 transition-colors">
                      <td className="p-3 font-bold text-white">{c.name}</td>
                      <td className="p-3 text-gray-400">{c.category}</td>
                      <td className="p-3 text-center font-mono font-bold" style={{ color: c.score > 80 ? '#50fa7b' : c.score > 60 ? '#f1fa8c' : '#ff5555' }}>
                        {c.score} / 100
                      </td>
                      <td className="p-3 font-semibold text-gray-300">{c.status}</td>
                      <td className="p-3 text-center text-gray-400 font-mono">{c.tickets}</td>
                      <td className="p-3 font-mono text-gray-400">{c.billingDelay}</td>
                      <td className="p-3 text-right font-bold" style={{ color: c.risk === 'LOW' ? '#50fa7b' : c.risk === 'MEDIUM' ? '#f1fa8c' : '#ff5555' }}>
                        {c.risk}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel 2: Smart OCR PDF Contract Parser */}
        <div className="flex flex-col gap-4">
          <div className="section-title text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">Optical Document Processing</div>
          <div className="card bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex-grow flex flex-col min-h-[350px]">
            
            <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-[#01FDF6]" /> AI OCR Scanner
            </h4>
            
            <p className="text-gray-500 text-[10px] leading-relaxed mb-4">
              Load signed agreement proposals to dynamically extract terms, entity identities, and trigger automated SLA visual warnings.
            </p>

            {/* Upload Area */}
            <div 
              onClick={handleSimulateScan}
              className={`ocr-drop-zone border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[140px] ${isScanning ? 'border-[#01FDF6] bg-[#01FDF6]/5' : 'border-gray-800 hover:border-[#01FDF6]/40 bg-gray-950/20'}`}
            >
              {isScanning ? (
                <>
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <RefreshCw size={22} className="text-[#01FDF6] animate-spin" />
                    <div className="scanner-laser-glow"></div>
                  </div>
                  <span className="text-xs text-[#01FDF6] font-bold font-mono tracking-wider animate-pulse">EXTRACTING METADATA CORES...</span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-gray-900 border border-gray-850 rounded-full flex items-center justify-center">
                    <Upload size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <span className="text-xs text-white font-bold block mb-1">Upload Agreement PDF</span>
                    <span className="text-[9px] text-gray-600 font-mono block">Supports SLA, NDA, and License PDF formats</span>
                  </div>
                </>
              )}
            </div>

            {selectedFile && (
              <div className="mt-3 px-3 py-2 bg-gray-950/60 border border-gray-900 rounded-lg flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Active File: {selectedFile}</span>
                <Badge variant="success">Loaded</Badge>
              </div>
            )}

            {/* Extracted Metadata outputs */}
            {scannedResult && (
              <div className="scanned-metadata-panel bg-gray-950/80 border border-gray-900 p-4 rounded-xl mt-4 flex flex-col gap-3 font-mono text-[10px] text-gray-400 leading-snug animate-fadeIn">
                <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider mb-1 border-b border-gray-900 pb-2">
                  <FileCheck size={14} className="text-[#50fa7b]" /> Extracted Structured Metadata
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Entity:</span>
                  <span className="text-white font-bold">{scannedResult.company}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Agreement Type:</span>
                  <span className="text-gray-300">{scannedResult.agreementType}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Contract Value:</span>
                  <span className="text-[#50fa7b] font-bold">{scannedResult.contractValue}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Effective Date:</span>
                  <span className="text-gray-300">{scannedResult.effectiveDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Renewal Period:</span>
                  <span className="text-gray-300">{scannedResult.renewalDate}</span>
                </div>

                <div className="flex flex-col gap-1 mt-1 pt-1.5 border-t border-gray-950">
                  <span className="text-gray-600">Extracted SLA Clauses:</span>
                  <span className="text-white bg-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-900 block font-sans leading-relaxed text-[9.5px]">
                    "{scannedResult.slaBreachThreshold}"
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1 border-t border-gray-950 pt-2 text-[9.5px]">
                  <span className="text-gray-600">AI Risk Assessment:</span>
                  <span className="text-[#50fa7b] font-bold">{scannedResult.aiAssessedRisk}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
