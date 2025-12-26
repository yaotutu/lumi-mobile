// 任务状态类型
export type TaskStatus =
  | 'generating_images' // 正在生成图片
  | 'images_ready' // 图片已生成，等待选择
  | 'generating_model' // 正在生成3D模型
  | 'model_ready' // 3D模型已完成
  | 'failed' // 失败
  | 'cancelled'; // 已取消

// 生成的图片接口
export interface GeneratedImage {
  id: string;
  url: string;
  thumbnail: string;
}

// 生成任务接口
export interface GenerationTask {
  id: string;
  prompt: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;

  // 图片生成阶段
  images?: GeneratedImage[];
  imageProgress?: number; // 0-100

  // 选择的图片
  selectedImageId?: string;

  // 3D模型生成阶段
  modelUrl?: string;
  modelProgress?: number; // 0-100

  // 错误信息
  error?: string;
}

// Create Store 状态接口
export interface CreateState {
  // 当前活动任务
  currentTask: GenerationTask | null;

  // 历史任务列表
  tasks: GenerationTask[];

  // 操作方法
  createTask: (prompt: string) => Promise<string>; // 返回taskId
  selectImage: (taskId: string, imageId: string) => Promise<void>;
  generateModel: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  getTask: (taskId: string) => GenerationTask | undefined;

  // 模拟后台更新任务进度（实际项目中应该是轮询或WebSocket）
  _updateTaskProgress: (taskId: string, progress: Partial<GenerationTask>) => void;

  // 重置状态
  reset: () => void;
}
