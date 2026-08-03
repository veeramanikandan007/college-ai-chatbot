import { fetchApi } from '../lib/api';

export interface WorkspaceListItem {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  color: string;
  icon: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_favorite: boolean;
  document_count: number;
  chat_count: number;
  note_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceDetailResponse extends WorkspaceListItem {
  documents: any[];
  chats: any[];
  notes: any[];
  quizzes: any[];
}

export interface WorkspaceCreatePayload {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
}

export interface WorkspaceUpdatePayload {
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_favorite?: boolean;
}

export const getWorkspaces = async (): Promise<WorkspaceListItem[]> => {
  return await fetchApi('/workspaces');
};

export const getWorkspaceDetail = async (id: number): Promise<WorkspaceDetailResponse> => {
  return await fetchApi(`/workspaces/${id}`);
};

export const createWorkspace = async (payload: WorkspaceCreatePayload): Promise<WorkspaceListItem> => {
  return await fetchApi('/workspaces', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateWorkspace = async (id: number, payload: WorkspaceUpdatePayload): Promise<WorkspaceListItem> => {
  return await fetchApi(`/workspaces/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteWorkspace = async (id: number): Promise<void> => {
  await fetchApi(`/workspaces/${id}`, { method: 'DELETE' });
};

export const linkWorkspaceItem = async (workspaceId: number, item_type: string, item_id: string | number): Promise<void> => {
  await fetchApi(`/workspaces/${workspaceId}/items`, {
    method: 'POST',
    body: JSON.stringify({ item_type, item_id }),
  });
};

export const unlinkWorkspaceItem = async (workspaceId: number, item_type: string, item_id: string | number): Promise<void> => {
  await fetchApi(`/workspaces/${workspaceId}/items`, {
    method: 'DELETE',
    body: JSON.stringify({ item_type, item_id }),
  });
};
