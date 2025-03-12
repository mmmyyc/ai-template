'use client'

import React, { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface PDFFile {
  id: string
  name: string
  size: string
  uploadedAt: string
  progress: number
  reviewData: Array<{ day: string; retention: number }>
}

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [readingProgress, setReadingProgress] = useState(0)
  const [selectedPDFDetail, setSelectedPDFDetail] = useState<PDFFile | null>(null)
  const modalRef = useRef<HTMLDialogElement>(null)
  
  // Sample PDF files data - in real app this would come from backend
  const [pdfFiles] = useState<PDFFile[]>([
    {
      id: '1',
      name: '中文学习笔记.pdf',
      size: '2.5 MB',
      uploadedAt: '2024-03-20',
      progress: 75,
      reviewData: [
        { day: '1', retention: 100 },
        { day: '2', retention: 80 },
        { day: '3', retention: 65 },
        { day: '5', retention: 55 },
        { day: '7', retention: 45 },
        { day: '14', retention: 35 },
        { day: '30', retention: 25 },
      ]
    },
    {
      id: '2',
      name: '汉字练习.pdf',
      size: '1.8 MB',
      uploadedAt: '2024-03-19',
      progress: 45,
      reviewData: [
        { day: '1', retention: 100 },
        { day: '2', retention: 75 },
        { day: '3', retention: 60 },
        { day: '5', retention: 50 },
        { day: '7', retention: 40 },
        { day: '14', retention: 30 },
        { day: '30', retention: 20 },
      ]
    }
  ])
  
  // Sample review curve data - in real app this would come from backend
  const reviewData = [
    { day: '1', retention: 100 },
    { day: '2', retention: 80 },
    { day: '3', retention: 65 },
    { day: '5', retention: 55 },
    { day: '7', retention: 45 },
    { day: '14', retention: 35 },
    { day: '30', retention: 25 },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      // Here you would typically start processing the PDF
    }
  }

  const handleOpenModal = (pdf: PDFFile) => {
    setSelectedPDFDetail(pdf)
    modalRef.current?.showModal()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Upload Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">PDF Upload</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF files only</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>
        </Card>

        {/* Reading Progress Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Reading Progress</h2>
          <div className="space-y-4">
            <Progress value={readingProgress} className="w-full" />
            <p className="text-sm text-gray-600">
              {readingProgress}% Complete
            </p>
          </div>
        </Card>

        {/* PDF Files List Section */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">PDF Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfFiles.map((pdf) => (
              <div
                key={pdf.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleOpenModal(pdf)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{pdf.name}</h3>
                    <p className="text-sm text-gray-500">Size: {pdf.size}</p>
                    <p className="text-sm text-gray-500">Uploaded: {pdf.uploadedAt}</p>
                  </div>
                </div>
                <Progress value={pdf.progress} className="mt-4" />
                <p className="text-sm text-gray-600 mt-2">
                  Progress: {pdf.progress}%
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Review Curve Section */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Memory Retention Curve</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="retention" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* PDF Detail Modal */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-3xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">{selectedPDFDetail?.name}</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">File Information</h3>
                <p className="text-sm text-gray-500">Size: {selectedPDFDetail?.size}</p>
                <p className="text-sm text-gray-500">Uploaded: {selectedPDFDetail?.uploadedAt}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Reading Progress</h3>
                <Progress value={selectedPDFDetail?.progress} className="mb-2" />
                <p className="text-sm text-gray-600">
                  {selectedPDFDetail?.progress}% Complete
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Memory Retention Curve</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedPDFDetail?.reviewData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="retention" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}
