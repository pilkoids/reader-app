import api from './api';

export interface CreateTextData {
  title: string;
  author?: string;
  isbn?: string;
  type?: 'pdf' | 'epub' | 'txt' | 'web';
  edition?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface Text {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  type: string | null;
  edition: string | null;
  url: string | null;
  metadata: any;
  createdAt: string;
  lastAccessed?: string;
}

const textService = {
  /**
   * Create or find a text entry
   */
  async createText(data: CreateTextData): Promise<Text> {
    const response = await api.post('/texts', data);
    return response.data.data;
  },

  /**
   * Get user's library of texts
   */
  async getUserTexts(): Promise<Text[]> {
    const response = await api.get('/texts');
    return response.data.data;
  },

  /**
   * Get a specific text by ID
   */
  async getTextById(id: string): Promise<Text> {
    const response = await api.get(`/texts/${id}`);
    return response.data.data;
  },
};

export default textService;
