"use client"

import { useState } from "react"
import { Folder, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl';

type UserFolder = {
  id: string
  name: string
  created_at: string
}

export function FolderManager() {
  // Sample initial folders
  const [folders, setFolders] = useState<UserFolder[]>([])

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations('Dashboard')

  const handleSelectFolder = (id: string) => {
    setSelectedFolderId(id === selectedFolderId ? null : id)
    const folder = folders.find(folder => folder.id === id)
    if (folder) {
      router.push(`/dashboard/generation/${folder.name}`)
    }
  }

  const handleCreateFolder = () => {
    // Prepare data in the format expected by the server
    const formData = new URLSearchParams();
    formData.append('folderName', newFolderName);

    fetch("/api/html-ppt/createfolder", {
      method: "POST",
      // Set the correct Content-Type header
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Send the URLSearchParams object as the body
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.data) {
        const { folderId, folderName, createdAt } = data.data;
        setFolders([...folders, { id: folderId, name: folderName, created_at: createdAt }]);
      } else {
        setError(data.error || t('createFolderError'));
      }
    })
    .catch(error => {
      console.error(t('createFolderFailLog'), error);
      setError(error.message || t('createFolderError'));
    })
    .finally(() => {
      setIsCreating(false);
      setNewFolderName("");
      setError(null);
    });
  }
  useEffect(() => {
    fetch("/api/html-ppt/listfolder")
    .then(response => response.json())
    .then(response => {
      if (response.data) {
        // Ensure folder data is always an array, default to [] if null/undefined
        const folderList = response.data.folder ?? [];
        setFolders(folderList);
        setError(null); // Clear previous errors on success
      } else {
        setError(response.error || t('listFolderError'));
        setFolders([]); // Ensure folders is an empty array on error
      }
    })
    .catch(error => {
      console.error(t('listFolderFailLog'), error);
      setError(error.message || t('listFolderNetworkError'));
      setFolders([]); // Ensure folders is an empty array on fetch failure
    })
  }, []);
  const formatDate = (date: string) => {    
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('myFoldersTitle')}</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            {t('newFolderButton')}
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
          <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <Input
            value={newFolderName}
            onChange={(e) => {
              setNewFolderName(e.target.value)
              setError(null)
            }}
            placeholder={t('newFolderNamePlaceholder')}
            className="h-9"
            autoFocus
          />
          <Button size="sm" onClick={handleCreateFolder}>
            {t('createButton')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsCreating(false)
              setNewFolderName("")
              setError(null)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {folders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t('noFoldersMessage')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders && folders.map((folder) => (
            <div
              key={folder.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50",
                selectedFolderId === folder.id && "border-blue-500 bg-blue-50",
              )}
              onClick={() => handleSelectFolder(folder.id)}
            >
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-500" />
                <span className="font-medium truncate">{folder.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t('createdOnLabel')} {formatDate(folder.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
