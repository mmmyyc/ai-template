"use client"

import { useState, useEffect } from "react"
import { Folder, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {useRouter} from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {useFormatter} from 'next-intl';
import { useFolderStore } from "../../store/folderStore"

export function FolderManager() {
  // Use the folder store instead of local state
  const { 
    folders, 
    selectedFolderId,
    error, 
    isLoading,
    fetchFolders,
    createFolder,
    selectFolder,
    setError
  } = useFolderStore()

  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const router = useRouter()
  const t = useTranslations('Dashboard')

  const handleSelectFolder = (id: string) => {
    const newSelectedId = id === selectedFolderId ? null : id
    selectFolder(newSelectedId)
    
    if (newSelectedId) {
      const folder = folders.find(folder => folder.id === id)
      if (folder) {
        router.push(`/dashboard/generation/${folder.name}`)
      }
    }
  }

  const handleCreateFolder = () => {
    createFolder(newFolderName)
      .then(() => {
        setIsCreating(false)
        setNewFolderName("")
      })
  }
  
  // Fetch folders on component mount
  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])
  
  const format = useFormatter();
  const formatDate = (date: string) => {    
    return format.dateTime(new Date(date), {
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
          <Button onClick={() => setIsCreating(true)} size="sm" className="flex items-center gap-1 create-folder">
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
            className="h-9 create-folder-name"
            autoFocus
          />
          <Button size="sm" onClick={handleCreateFolder} disabled={isLoading} className="create-folder-button">
            {isLoading ? t('loading') : t('createButton')}
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

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
      ) : folders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t('noFoldersMessage')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
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
