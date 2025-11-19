export interface StyleOption {
  id: number;
  name: string;
  description: string;
  preview?: string;
  category: string;
}

export interface Generation {
  id: string;
  prompt: string;
  selectedStyle: StyleOption | null;
  generatedAt: Date;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  resultUrl?: string;
  error?: string;
}

export interface CreateState {
  // 输入状态
  prompt: string;

  // 风格选择状态
  selectedStyle: StyleOption | null;
  showStyles: boolean;

  // 生成状态
  isGenerating: boolean;
  generationProgress: number; // 0-100
  currentGenerationId: string | null;

  // 历史记录
  generationHistory: Generation[];

  // UI 状态
  showAdvancedOptions: boolean;

  // Actions
  setPrompt: (prompt: string) => void;
  selectStyle: (style: StyleOption | null) => void;
  showStyleSelector: () => void;
  hideStyleSelector: () => void;
  startGeneration: (abortController?: AbortController) => Promise<void>;
  cancelGeneration: () => void;
  setGenerationProgress: (progress: number) => void;
  completeGeneration: (resultUrl: string) => void;
  failGeneration: (error: string) => void;
  updateGenerationStatus: (
    id: string,
    status: Generation['status'],
    error?: string,
    resultUrl?: string
  ) => void;
  addToHistory: (generation: Omit<Generation, 'id' | 'generatedAt'>) => void;
  clearHistory: () => void;
  toggleAdvancedOptions: () => void;
  reset: () => void;
}
