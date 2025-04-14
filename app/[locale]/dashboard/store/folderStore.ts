import { create } from 'zustand'
import { useEffect } from 'react'

// Define the types
interface Folder {
  id: string
  name: string
  created_at: string
}

interface FolderState {
  // State
  folders: Folder[]
  selectedFolderId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  selectFolder: (folderId: string | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  
  // API Actions
  fetchFolders: () => Promise<void>
  createFolder: (folderName: string) => Promise<void>
}

export const useFolderStore = create<FolderState>((set, get) => ({
  // Initial state
  folders: [],
  selectedFolderId: null,
  isLoading: false,
  error: null,

  // State setters
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((state) => ({ 
    folders: [...state.folders, folder] 
  })),
  selectFolder: (folderId) => set({ selectedFolderId: folderId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // API actions
  fetchFolders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/html-ppt/listfolder");
      const data = await response.json();
      
      if (data.data) {
        // Ensure folder data is always an array, default to [] if null/undefined
        const folderList = data.data.folder ?? [];
        set({ folders: folderList, error: null });
      } else {
        set({ 
          folders: [], 
          error: data.error || "Failed to load folders" 
        });
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      set({ 
        folders: [], 
        error: error instanceof Error ? error.message : "Network error" 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createFolder: async (folderName) => {
    set({ isLoading: true, error: null });
    try {
      // Prepare data in the format expected by the server
      const formData = new URLSearchParams();
      formData.append('folderName', folderName);

      const response = await fetch("/api/html-ppt/createfolder", {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.data) {
        const { folderId, folderName, createdAt } = data.data;
        const newFolder = { 
          id: folderId, 
          name: folderName, 
          created_at: createdAt 
        };
        
        set((state) => ({
          folders: [...state.folders, newFolder],
          error: null
        }));
      } else {
        set({ error: data.error || "Failed to create folder" });
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
      set({ 
        error: error instanceof Error ? error.message : "Network error" 
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Custom hook to get the selected folder data
export function useSelectedFolder() {
  const { selectedFolderId, folders, fetchFolders } = useFolderStore();
  
  // Fetch folders if not already loaded
  useEffect(() => {
    if (folders.length === 0) {
      fetchFolders();
    }
  }, [folders.length, fetchFolders]);
  
  // Find the selected folder
  const selectedFolder = folders.find(folder => folder.id === selectedFolderId) || null;
  
  return {
    selectedFolderId,
    selectedFolder,
    // Return other useful data and functions
    selectFolder: useFolderStore(state => state.selectFolder),
    isLoading: useFolderStore(state => state.isLoading)
  };
} 