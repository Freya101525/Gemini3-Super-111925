import { AgentConfig, ThemeConfig, Translation } from './types';

export const FLOWER_THEMES: Record<string, ThemeConfig> = {
  "Cherry Blossom": {
    name: "櫻花 Cherry Blossom",
    primary: "#FFB7C5",
    secondary: "#FFC0CB",
    accent: "#FF69B4",
    bgLight: "linear-gradient(135deg, #fff0f5 0%, #ffeef2 100%)",
    bgDark: "linear-gradient(135deg, #2d1b2e 0%, #1a0f11 100%)",
    icon: "🌸",
    textColorLight: "#4a4a4a",
    textColorDark: "#f0f0f0"
  },
  "Rose": {
    name: "玫瑰 Rose",
    primary: "#E91E63",
    secondary: "#F06292",
    accent: "#C2185B",
    bgLight: "linear-gradient(135deg, #fff0f3 0%, #fff5f7 100%)",
    bgDark: "linear-gradient(135deg, #2d0f16 0%, #1a0508 100%)",
    icon: "🌹",
    textColorLight: "#4a2c36",
    textColorDark: "#ffebee"
  },
  "Lavender": {
    name: "薰衣草 Lavender",
    primary: "#9C27B0",
    secondary: "#BA68C8",
    accent: "#7B1FA2",
    bgLight: "linear-gradient(135deg, #f8f0ff 0%, #f3e5f5 100%)",
    bgDark: "linear-gradient(135deg, #1f0f2d 0%, #0f051a 100%)",
    icon: "💜",
    textColorLight: "#3c2a4a",
    textColorDark: "#f3e5f5"
  },
  "Sunflower": {
    name: "向日葵 Sunflower",
    primary: "#FFC107",
    secondary: "#FFD54F",
    accent: "#FFA000",
    bgLight: "linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%)",
    bgDark: "linear-gradient(135deg, #2d260f 0%, #1a1505 100%)",
    icon: "🌻",
    textColorLight: "#4a402a",
    textColorDark: "#fffde7"
  },
  "Ocean": {
    name: "海洋 Ocean",
    primary: "#03A9F4",
    secondary: "#4FC3F7",
    accent: "#0288D1",
    bgLight: "linear-gradient(135deg, #f0faff 0%, #e1f5fe 100%)",
    bgDark: "linear-gradient(135deg, #0f1e2d 0%, #050e1a 100%)",
    icon: "🌊",
    textColorLight: "#2a3c4a",
    textColorDark: "#e1f5fe"
  }
};

export const TRANSLATIONS: Record<string, Translation> = {
  "zh_TW": {
    title: "TFDA Agentic AI 輔助審查系統",
    subtitle: "智慧文件分析與資料提取自動化平台",
    themeSelector: "介面主題",
    language: "語言",
    darkMode: "深色模式",
    uploadTab: "1. 上傳與辨識",
    previewTab: "2. 預覽與編輯",
    configTab: "3. 代理設定",
    executeTab: "4. 執行審查",
    dashboardTab: "5. 分析儀表板",
    notesTab: "6. 審查筆記",
    uploadPdf: "上傳 PDF 文件",
    startOcr: "開始智慧辨識 (模擬)",
    runAll: "⚡ 自動執行所有代理人",
    providers: "API 金鑰設定"
  },
  "en": {
    title: "TFDA Agentic AI Review System",
    subtitle: "Intelligent Document Analysis & Data Extraction Platform",
    themeSelector: "Theme",
    language: "Language",
    darkMode: "Dark Mode",
    uploadTab: "1. Upload & OCR",
    previewTab: "2. Preview & Edit",
    configTab: "3. Agent Config",
    executeTab: "4. Execute",
    dashboardTab: "5. Dashboard",
    notesTab: "6. Notes",
    uploadPdf: "Upload PDF",
    startOcr: "Start OCR (Simulated)",
    runAll: "⚡ Auto-Run All Agents",
    providers: "API Keys"
  }
};

export const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: "1",
    name: "1. 申請資料提取器 (Extraction)",
    description: "提取基本行政資料、廠商資訊、證書細節。",
    systemPrompt: "你是一位專業的醫療器材法規專家。請從文件中提取關鍵行政資訊：廠商名稱、地址、產品名稱、類別、證書編號、日期。若有不確定資訊請標註。輸出為Markdown表格。",
    userPrompt: "分析文件並提取申請基本資料：",
    model: "gemini-2.5-flash",
    temperature: 0,
    maxTokens: 2000
  },
  {
    id: "2",
    name: "2. 適應症與禁忌症分析 (Clinical)",
    description: "分析產品適應症、禁忌症及副作用。",
    systemPrompt: "你是臨床醫學專家。請分析文件的：1. 適應症 (Indications) 2. 禁忌症 (Contraindications) 3. 副作用與警語。請用列點方式呈現，並標註風險等級。",
    userPrompt: "請分析以下內容的臨床相關資訊：",
    model: "gemini-2.5-flash",
    temperature: 0.3,
    maxTokens: 1500
  },
  {
    id: "3",
    name: "3. 技術規格與檢驗摘要 (Technical)",
    description: "摘要產品技術規格、檢驗標準與測試結果。",
    systemPrompt: "你是生醫工程專家。請摘要：1. 產品技術規格 2. 已進行的測試項目 (如生物相容性、電性安全) 3. 檢驗結果摘要。忽略過於瑣碎的數據，只抓重點。",
    userPrompt: "請摘要技術規格與檢驗結果：",
    model: "gemini-2.5-flash",
    temperature: 0.2,
    maxTokens: 1500
  },
  {
    id: "4",
    name: "4. 法規符合性檢查 (Compliance)",
    description: "根據TFDA要求檢查文件完整性與合規性。",
    systemPrompt: "你是資深法規稽核員。根據前述資訊與原文，檢查：1. 是否符合醫療器材分類分級規定？ 2. 標示是否包含必要警語？ 3. 是否有明顯缺漏文件？提供審查建議。",
    userPrompt: "請進行法規符合性檢查並提供建議：",
    model: "gemini-2.5-flash",
    temperature: 0.4,
    maxTokens: 1500
  },
  {
    id: "5",
    name: "5. 綜合審查報告生成 (Reporting)",
    description: "整合所有分析，生成最終審查報告。",
    systemPrompt: "你是審查報告主筆。請根據上下文提供的所有分析結果，撰寫一份結構完整的「醫療器材查驗登記審查報告」。包含：摘要、產品描述、臨床評估、技術評估、結論與建議。",
    userPrompt: "請撰寫綜合審查報告：",
    model: "gemini-2.5-flash",
    temperature: 0.5,
    maxTokens: 3000
  }
];

// Mock data to simulate OCR for client-side demo purposes
export const MOCK_OCR_TEXT = `
--- PAGE 1 ---
醫療器材查驗登記申請書
申請日期：2024年01月15日
申請商名稱：未來生醫科技有限公司
地址：台北市南港區軟體園區街1號10樓
產品名稱（中文）："未來" 智慧型心律調節器
產品名稱（英文）："Future" Smart Pacemaker
型號：FP-2000, FP-2000 Pro
分類分級：I.1234 心臟血管外科裝置 - 第三等級 (Class III)
製造廠名稱：Future MedTech Inc.
製造廠地址：123 Innovation Drive, Silicon Valley, CA, USA

--- PAGE 2 ---
適應症 (Indications):
本產品適用於治療心跳過緩 (Bradycardia) 之病患，包括病竇症候群 (Sick Sinus Syndrome) 及房室傳導阻滯 (AV Block)。
本產品具備藍牙連線功能，可搭配特定App進行遠端監測。

禁忌症 (Contraindications):
1. 已知對鈦合金或聚合物過敏之病患。
2. 預計進行核磁共振 (MRI) 掃描之病患，除非確認為MRI Conditional模式。
3. 具有嚴重精神疾病無法配合醫囑者。

--- PAGE 3 ---
技術規格 (Technical Specifications):
- 電池壽命：約 10-12 年
- 體積：15cc
- 重量：25g
- 導線接頭：IS-1 標準接頭

安全性測試 (Safety Testing):
依據 IEC 60601-1 進行電性安全測試：合格 (Pass)
依據 ISO 10993 進行生物相容性測試：
- 細胞毒性：無反應
- 致敏性：無反應
- 刺激性：無反應

--- PAGE 4 ---
臨床評估摘要：
本產品引用同等品比較 (Predicate Device)，與已上市之 K123456 號產品具備實質等同性。
無新增之重大臨床風險。
`;
