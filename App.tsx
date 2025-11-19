import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  PlayCircle, 
  UploadCloud, 
  Moon, 
  Sun, 
  Languages, 
  Menu, 
  Bot, 
  Save, 
  Download, 
  RotateCcw,
  Key,
  ChevronRight,
  Activity,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';

import { FLOWER_THEMES, TRANSLATIONS, DEFAULT_AGENTS, MOCK_OCR_TEXT } from './constants';
import { AgentConfig, ExecutionMetric, Language } from './types';
import { generateText } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [themeKey, setThemeKey] = useState<string>("Cherry Blossom");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>("zh_TW");
  const [activeTab, setActiveTab] = useState(0);
  
  // Data State
  const [ocrText, setOcrText] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  
  // Config State
  const [agents, setAgents] = useState<AgentConfig[]>(DEFAULT_AGENTS);
  const [apiKeys, setApiKeys] = useState<{gemini: string, openai: string, anthropic: string}>({
    gemini: "",
    openai: "",
    anthropic: ""
  });
  
  // Execution State
  const [agentOutputs, setAgentOutputs] = useState<string[]>(new Array(DEFAULT_AGENTS.length).fill(""));
  const [metrics, setMetrics] = useState<ExecutionMetric[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentAgentIndex, setCurrentAgentIndex] = useState<number | null>(null);
  
  // Notes State
  const [notes, setNotes] = useState<string>("## Review Notes\n\nStart by adding agent outputs here.");

  // --- Derived Constants ---
  const currentTheme = FLOWER_THEMES[themeKey];
  const t = TRANSLATIONS[language];
  const isConnected = !!apiKeys.gemini; // Simplified for demo

  // --- Handlers ---

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      // In a real app, we'd parse PDF here using pdfjs-dist. 
      // For this UI demo, we simulate OCR.
    }
  };

  const handleSimulateOCR = () => {
    if (!uploadedFileName) return;
    setIsProcessingOCR(true);
    setTimeout(() => {
      setOcrText(MOCK_OCR_TEXT);
      setIsProcessingOCR(false);
      setActiveTab(1); // Move to preview
    }, 1500);
  };

  const handleRunAgents = async () => {
    if (!ocrText) {
      alert("Please process a document first!");
      return;
    }
    if (!apiKeys.gemini) {
      alert("Please provide a Gemini API Key in the sidebar settings.");
      return;
    }

    setIsExecuting(true);
    setMetrics([]);
    setAgentOutputs(new Array(agents.length).fill(""));
    let currentContext = ocrText;
    let newMetrics: ExecutionMetric[] = [];

    for (let i = 0; i < agents.length; i++) {
      setCurrentAgentIndex(i);
      const agent = agents[i];
      const startTime = Date.now();

      // Use Gemini service
      const { text, tokens } = await generateText(
        apiKeys.gemini,
        agent.model,
        agent.systemPrompt,
        agent.userPrompt,
        currentContext,
        agent.temperature,
        agent.maxTokens
      );

      const latency = (Date.now() - startTime) / 1000;
      
      // Update outputs progressively
      setAgentOutputs(prev => {
        const next = [...prev];
        next[i] = text;
        return next;
      });

      const metric: ExecutionMetric = {
        agentName: agent.name,
        latency,
        tokens,
        provider: "Gemini",
        timestamp: Date.now()
      };
      newMetrics.push(metric);
      setMetrics([...newMetrics]);

      // Chain context: append result to context for next agent
      currentContext += `\n\n=== Output from ${agent.name} ===\n${text}`;
    }

    setIsExecuting(false);
    setCurrentAgentIndex(null);
  };

  const handleAddToNotes = (text: string, title: string) => {
    setNotes(prev => `${prev}\n\n### ${title}\n${text}`);
  };

  // --- Render Helpers ---

  const bgStyle = darkMode 
    ? { background: currentTheme.bgDark, color: currentTheme.textColorDark }
    : { background: currentTheme.bgLight, color: currentTheme.textColorLight };

  const cardClass = `rounded-2xl p-6 shadow-xl transition-all duration-300 ${darkMode ? 'glass-dark text-white' : 'glass text-gray-800'}`;
  
  const inputClass = `w-full p-2 rounded-lg border outline-none transition-colors ${
    darkMode 
      ? 'bg-gray-800/50 border-gray-600 focus:border-pink-400 text-white' 
      : 'bg-white/50 border-gray-200 focus:border-pink-500 text-gray-800'
  }`;

  const buttonPrimary = {
    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
    color: 'white'
  };

  // --- UI Components ---

  const Sidebar = () => (
    <div className={`w-80 flex-shrink-0 h-screen overflow-y-auto p-6 flex flex-col gap-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900/90' : 'bg-white/80'} backdrop-blur-md border-r border-gray-200/20`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl animate-bounce">{currentTheme.icon}</span>
        <div>
          <h1 className="text-xl font-bold leading-tight">TFDA AI</h1>
          <p className="text-xs opacity-60 font-medium tracking-wider">REVIEW SYSTEM</p>
        </div>
      </div>

      {/* Theme & Language */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase opacity-50">{t.themeSelector}</label>
          <select 
            value={themeKey}
            onChange={(e) => setThemeKey(e.target.value)}
            className={inputClass}
          >
            {Object.keys(FLOWER_THEMES).map(k => <option key={k} value={k}>{FLOWER_THEMES[k].name}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}
          >
            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            <span className="text-sm">{t.darkMode}</span>
          </button>
          <button 
            onClick={() => setLanguage(language === 'zh_TW' ? 'en' : 'zh_TW')}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}
          >
            <Languages size={16} />
            <span className="text-sm">{language === 'zh_TW' ? 'EN' : '繁中'}</span>
          </button>
        </div>
      </div>

      <hr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

      {/* API Keys */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase opacity-50 flex items-center gap-2">
            <Key size={12} /> {t.providers}
          </label>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isConnected ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
            {isConnected ? "Active" : "Missing Key"}
          </span>
        </div>
        
        <div className="space-y-2">
          <input 
            type="password" 
            placeholder="Gemini API Key (Required)"
            value={apiKeys.gemini}
            onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})}
            className={inputClass}
          />
           <input 
            type="password" 
            placeholder="OpenAI API Key (Optional)"
            value={apiKeys.openai}
            disabled
            className={`${inputClass} opacity-50 cursor-not-allowed`} 
          />
           <input 
            type="password" 
            placeholder="Anthropic API Key (Optional)"
            value={apiKeys.anthropic}
            disabled
            className={`${inputClass} opacity-50 cursor-not-allowed`}
          />
        </div>
        <p className="text-[10px] opacity-50 leading-tight">
          Your keys are stored locally in browser memory and never sent to our servers.
        </p>
      </div>
      
      <div className="mt-auto opacity-40 text-[10px] text-center">
        v2.0.0 • React Client-Side Edition
      </div>
    </div>
  );

  const TabButton = ({ index, label, icon: Icon }: { index: number, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(index)}
      className={`flex items-center gap-2 px-5 py-3 rounded-t-lg transition-all duration-300 relative group ${
        activeTab === index 
          ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} font-semibold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]`
          : `opacity-60 hover:opacity-100 hover:bg-white/10`
      }`}
    >
      <Icon size={16} className={activeTab === index ? `text-[${currentTheme.accent}]` : ''} style={{ color: activeTab === index ? currentTheme.accent : 'inherit' }} />
      {label}
      {activeTab === index && (
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-full" style={{ background: currentTheme.accent }} />
      )}
    </button>
  );

  return (
    <div className="flex h-screen w-screen transition-colors duration-500" style={bgStyle}>
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.title}</h2>
            <p className="opacity-60 mt-1">{t.subtitle}</p>
          </div>
          
          {/* Quick Stats Pill */}
          <div className={`px-4 py-2 rounded-full border flex items-center gap-4 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
             <div className="flex items-center gap-2">
                <Activity size={14} className="text-green-500" />
                <span className="text-xs font-bold">System Ready</span>
             </div>
             <div className="w-px h-4 bg-gray-400/30"></div>
             <div className="text-xs opacity-70">{agents.length} Agents Configured</div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="px-8 flex gap-2 border-b border-gray-200/10 overflow-x-auto">
          <TabButton index={0} label={t.uploadTab} icon={UploadCloud} />
          <TabButton index={1} label={t.previewTab} icon={FileText} />
          <TabButton index={2} label={t.configTab} icon={Settings} />
          <TabButton index={3} label={t.executeTab} icon={PlayCircle} />
          <TabButton index={4} label={t.dashboardTab} icon={LayoutDashboard} />
          <TabButton index={5} label={t.notesTab} icon={Menu} />
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {/* Tab 0: Upload */}
          {activeTab === 0 && (
            <div className="max-w-3xl mx-auto">
              <div className={`${cardClass} flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse`} style={{ background: `${currentTheme.primary}20` }}>
                  <UploadCloud size={40} style={{ color: currentTheme.primary }} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t.uploadPdf}</h3>
                <p className="opacity-60 mb-8 text-center max-w-md">
                  Drag and drop your medical device application PDF here, or click to browse.
                  (Client-side processing only)
                </p>
                
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="pdf-upload"
                />
                <label 
                  htmlFor="pdf-upload" 
                  className="px-8 py-3 rounded-lg font-bold cursor-pointer hover:scale-105 transition-transform shadow-lg"
                  style={buttonPrimary}
                >
                  Select File
                </label>

                {uploadedFileName && (
                  <div className="mt-8 w-full max-w-md">
                    <div className={`p-4 rounded-lg flex items-center justify-between ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                       <div className="flex items-center gap-3">
                          <FileText className="text-red-400" />
                          <span className="font-medium truncate">{uploadedFileName}</span>
                       </div>
                       <CheckCircle size={18} className="text-green-500" />
                    </div>
                    
                    <button 
                      onClick={handleSimulateOCR}
                      disabled={isProcessingOCR}
                      className="w-full mt-4 py-3 rounded-lg font-bold border-2 flex items-center justify-center gap-2 transition-all hover:bg-opacity-10"
                      style={{ borderColor: currentTheme.primary, color: currentTheme.primary }}
                    >
                      {isProcessingOCR ? (
                         <span className="flex items-center gap-2">Processing <Activity className="animate-spin" size={16}/></span>
                      ) : (
                         t.startOcr
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 1: Preview */}
          {activeTab === 1 && (
             <div className="h-full flex flex-col">
                <div className={`${cardClass} flex-1 flex flex-col`}>
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Extracted Text Content</h3>
                      <button 
                        onClick={() => setOcrText("")}
                        className="text-xs text-red-400 hover:text-red-500 font-medium"
                      >
                        Clear Context
                      </button>
                   </div>
                   <textarea 
                      value={ocrText}
                      onChange={(e) => setOcrText(e.target.value)}
                      className={`flex-1 w-full resize-none p-4 rounded-lg font-mono text-sm ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'} focus:outline-none`}
                      placeholder="No text loaded. Please upload a document first."
                   />
                </div>
             </div>
          )}

          {/* Tab 2: Config */}
          {activeTab === 2 && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Agent Pipeline Configuration</h3>
                <button 
                   onClick={() => setAgents(DEFAULT_AGENTS)}
                   className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100"
                >
                  <RotateCcw size={14} /> Reset Defaults
                </button>
              </div>

              {agents.map((agent, idx) => (
                <div key={agent.id} className={cardClass}>
                   <div className="flex justify-between items-start mb-4 border-b border-gray-500/10 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md" style={{ background: currentTheme.primary }}>
                            {idx + 1}
                         </div>
                         <div>
                            <input 
                              value={agent.name}
                              onChange={(e) => {
                                const newAgents = [...agents];
                                newAgents[idx].name = e.target.value;
                                setAgents(newAgents);
                              }}
                              className="font-bold bg-transparent border-none focus:ring-0 p-0 text-lg"
                            />
                            <p className="text-xs opacity-60">{agent.description}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono opacity-70 bg-gray-500/10 px-2 py-1 rounded">
                         <Bot size={12} /> {agent.model}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold uppercase opacity-50 mb-1 block">System Prompt</label>
                         <textarea 
                            value={agent.systemPrompt}
                            onChange={(e) => {
                              const newAgents = [...agents];
                              newAgents[idx].systemPrompt = e.target.value;
                              setAgents(newAgents);
                            }}
                            className={`${inputClass} h-24 text-xs`}
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold uppercase opacity-50 mb-1 block">User Prompt</label>
                         <textarea 
                            value={agent.userPrompt}
                            onChange={(e) => {
                              const newAgents = [...agents];
                              newAgents[idx].userPrompt = e.target.value;
                              setAgents(newAgents);
                            }}
                            className={`${inputClass} h-24 text-xs`}
                         />
                      </div>
                   </div>
                   
                   <div className="mt-4 flex gap-4 items-center">
                      <div className="flex-1">
                         <label className="text-xs font-bold uppercase opacity-50 flex justify-between">
                            Temperature <span>{agent.temperature}</span>
                         </label>
                         <input 
                            type="range" min="0" max="1" step="0.1" 
                            value={agent.temperature}
                            onChange={(e) => {
                              const newAgents = [...agents];
                              newAgents[idx].temperature = parseFloat(e.target.value);
                              setAgents(newAgents);
                            }}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                            style={{ accentColor: currentTheme.accent }}
                         />
                      </div>
                      <div className="w-32">
                         <label className="text-xs font-bold uppercase opacity-50">Max Tokens</label>
                         <input 
                            type="number" 
                            value={agent.maxTokens}
                            onChange={(e) => {
                              const newAgents = [...agents];
                              newAgents[idx].maxTokens = parseInt(e.target.value);
                              setAgents(newAgents);
                            }}
                            className={inputClass}
                         />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Execute */}
          {activeTab === 3 && (
            <div className="h-full flex flex-col max-w-6xl mx-auto w-full">
              {!isExecuting && !metrics.length && (
                 <div className="flex justify-center mb-8">
                    <button 
                      onClick={handleRunAgents}
                      className="px-12 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3"
                      style={buttonPrimary}
                    >
                      {t.runAll}
                    </button>
                 </div>
              )}
              
              {isExecuting && (
                <div className="mb-8 text-center animate-pulse">
                   <div className="text-2xl font-light mb-2">
                      Agent <span className="font-bold" style={{color: currentTheme.accent}}>#{currentAgentIndex !== null ? currentAgentIndex + 1 : ''}</span> is processing...
                   </div>
                   <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                      <div className="h-full w-1/3 bg-gradient-to-r from-transparent to-white opacity-50 animate-[shimmer_1s_infinite]"></div>
                      <div className="h-full w-full transition-all duration-500 origin-left" style={{ background: currentTheme.primary, transform: `scaleX(${(currentAgentIndex || 0) / agents.length})` }}></div>
                   </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-6 pb-20">
                 {agentOutputs.map((output, idx) => (
                    <div key={idx} className={`transition-all duration-500 ${output ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
                       <div className={cardClass}>
                          <div className="flex justify-between items-center mb-4">
                             <h4 className="font-bold flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: currentTheme.secondary }}>{idx+1}</div>
                                {agents[idx].name}
                             </h4>
                             <div className="flex gap-2">
                                <button 
                                   onClick={() => handleAddToNotes(output, agents[idx].name)}
                                   className="text-xs px-3 py-1 rounded-full border border-gray-500/20 hover:bg-gray-500/10 transition-colors"
                                >
                                   + Add to Notes
                                </button>
                             </div>
                          </div>
                          <div className={`prose max-w-none text-sm ${darkMode ? 'prose-invert' : ''}`}>
                             <ReactMarkdown>{output}</ReactMarkdown>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* Tab 4: Dashboard */}
          {activeTab === 4 && (
             <div className="max-w-6xl mx-auto w-full space-y-6">
                {metrics.length === 0 ? (
                   <div className="text-center opacity-50 py-20">No execution data available. Run the pipeline first.</div>
                ) : (
                   <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className={cardClass}>
                            <div className="text-xs uppercase opacity-60 font-bold">Total Latency</div>
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                               {metrics.reduce((acc, m) => acc + m.latency, 0).toFixed(2)}s
                            </div>
                         </div>
                         <div className={cardClass}>
                            <div className="text-xs uppercase opacity-60 font-bold">Est. Tokens</div>
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                               {metrics.reduce((acc, m) => acc + m.tokens, 0)}
                            </div>
                         </div>
                         <div className={cardClass}>
                            <div className="text-xs uppercase opacity-60 font-bold">Avg Speed</div>
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
                               {(metrics.reduce((acc, m) => acc + m.latency, 0) / metrics.length).toFixed(2)}s/step
                            </div>
                         </div>
                      </div>

                      <div className={`${cardClass} h-96`}>
                         <h3 className="font-bold mb-6">Performance by Agent</h3>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics}>
                               <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#333' : '#eee'} vertical={false} />
                               <XAxis dataKey="agentName" tick={{fontSize: 10, fill: darkMode ? '#aaa' : '#666'}} interval={0} />
                               <YAxis tick={{fontSize: 10, fill: darkMode ? '#aaa' : '#666'}} />
                               <Tooltip 
                                  contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                  itemStyle={{ color: darkMode ? '#fff' : '#000' }}
                               />
                               <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                                  {metrics.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={index % 2 === 0 ? currentTheme.primary : currentTheme.secondary} />
                                  ))}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </>
                )}
             </div>
          )}

          {/* Tab 5: Notes */}
          {activeTab === 5 && (
             <div className="h-full flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
                <div className={`${cardClass} flex-1 flex flex-col`}>
                   <h3 className="font-bold mb-4 flex items-center gap-2">
                      <FileText size={18} /> Editor (Markdown)
                   </h3>
                   <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`flex-1 w-full resize-none p-4 rounded-lg font-mono text-sm ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2`}
                      style={{ '--tw-ring-color': currentTheme.primary } as any}
                   />
                </div>
                <div className={`${cardClass} flex-1 flex flex-col overflow-hidden`}>
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold">Preview</h3>
                      <button className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100">
                         <Download size={12} /> Export PDF
                      </button>
                   </div>
                   <div className={`flex-1 overflow-y-auto prose max-w-none ${darkMode ? 'prose-invert' : ''} pr-2`}>
                      <ReactMarkdown>{notes}</ReactMarkdown>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;