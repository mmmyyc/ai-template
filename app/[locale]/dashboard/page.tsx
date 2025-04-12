import { FolderManager } from "./components/floder/folder-manager"
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Dashboard');
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('folderManagementTitle')}</h1>
      <FolderManager />
    </main>
  )
}

