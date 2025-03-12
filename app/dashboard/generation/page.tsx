'use client'

import React, { useState, useEffect } from 'react'
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  MessageCircle, 
  Network, 
  LineChart, 
  FileText, 
  LightbulbIcon, 
  CheckCircle2 
} from "lucide-react";

export default function InteractiveLearningPage() {
  const [originalText, setOriginalText] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [highlightedText, setHighlightedText] = useState<string>("");
  const [annotations, setAnnotations] = useState<Array<{text: string, position: number}>>([]);
  const [memoryProgress, setMemoryProgress] = useState<number>(0);
  const [conceptMap, setConceptMap] = useState<any>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [qaMessages, setQaMessages] = useState<Array<{role: string, content: string}>>([]);

  // 模拟的文本内容
  useEffect(() => {
    const sampleText = `作为一种语言，汉语有其独特的特点和挑战。汉语是一种声调语言，共有四个声调和一个轻声。每个声调都会改变字的意思，例如"妈"(mā, 第一声)、"麻"(má, 第二声)、"马"(mǎ, 第三声)和"骂"(mà, 第四声)具有完全不同的含义。
    
汉字是表意文字，每个字都代表一个概念或想法，而不仅仅是一个音素。这使得学习汉字比学习拼音文字需要更多的记忆工作。然而，一旦掌握了基本汉字，理解复合词就会变得更加容易，因为许多复合词的含义可以从其组成部分中推断出来。

中文语法相对简单，没有时态变化、性别区分或复数形式。然而，量词的使用可能对初学者来说是一个挑战，因为不同类型的名词需要不同的量词。例如，"一本书"中的"本"是量词，而"三辆车"中的"辆"也是量词。`;
    
    setOriginalText(sampleText);
    
    // 模拟生成智能摘要
    const generatedSummary = "汉语是一种具有四个声调的声调语言，每个声调改变字的含义。汉字是表意文字，每个字代表一个概念。中文语法相对简单，但量词的使用可能对初学者构成挑战。";
    setSummary(generatedSummary);
    
    // 模拟记忆进度
    setMemoryProgress(35);
  }, []);

  // 处理文本高亮
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setHighlightedText(selection.toString());
      toast.success("文本已高亮");
    }
  };

  // 添加批注
  const addAnnotation = () => {
    if (highlightedText) {
      const position = originalText.indexOf(highlightedText);
      if (position !== -1) {
        setAnnotations([...annotations, {
          text: `关于"${highlightedText}"的笔记`,
          position: position
        }]);
        toast.success("批注已添加");
      }
    }
  };

  // 发送问题
  const sendQuestion = () => {
    if (!userQuestion.trim()) {
      toast.error("请输入问题");
      return;
    }

    setIsLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      setQaMessages([
        ...qaMessages, 
        {role: "user", content: userQuestion},
        {role: "assistant", content: `关于"${userQuestion}"的回答：汉语学习需要持续的练习和记忆。建议您尝试使用间隔重复法来增强记忆效果。`}
      ]);
      setUserQuestion("");
      setIsLoading(false);
    }, 1000);
  };

  // 生成概念图谱
  const generateConceptMap = () => {
    setIsLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      setConceptMap({
        nodes: [
          {id: 1, label: "汉语", size: 30},
          {id: 2, label: "声调", size: 20},
          {id: 3, label: "汉字", size: 25},
          {id: 4, label: "语法", size: 20},
          {id: 5, label: "量词", size: 15},
        ],
        edges: [
          {from: 1, to: 2},
          {from: 1, to: 3},
          {from: 1, to: 4},
          {from: 4, to: 5},
        ]
      });
      setIsLoading(false);
      toast.success("概念图谱已生成");
    }, 1500);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">交互式学习界面</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 左侧区域: 原文展示 */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <BookOpen className="mr-2" size={20} />
            <h2 className="text-xl font-semibold">原文内容</h2>
          </div>
          <div 
            className="prose max-w-none" 
            onMouseUp={handleTextSelection}
          >
            {originalText.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
          
          {highlightedText && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-medium">已选择文本:</p>
              <p className="italic">"{highlightedText}"</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addAnnotation} 
                className="mt-2"
              >
                添加批注
              </Button>
            </div>
          )}
          
          {annotations.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">批注列表:</h3>
              <ul className="space-y-2">
                {annotations.map((annotation, index) => (
                  <li key={index} className="p-2 bg-blue-50 border border-blue-200 rounded">
                    {annotation.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 右侧区域：交互功能 */}
        <div className="md:col-span-1">
          <Tabs defaultValue="qa" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="qa" className="flex items-center">
                <MessageCircle className="mr-1" size={16} />
                <span>问答</span>
              </TabsTrigger>
              <TabsTrigger value="concept" className="flex items-center">
                <Network className="mr-1" size={16} />
                <span>概念图谱</span>
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex items-center">
                <LineChart className="mr-1" size={16} />
                <span>记忆进度</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="qa">
              <Card>
                <CardHeader>
                  <CardTitle>实时问答</CardTitle>
                  <CardDescription>随时提问，获取即时解答</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 overflow-y-auto mb-4 space-y-2 border rounded p-2">
                    {qaMessages.length > 0 ? (
                      qaMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'}`}
                        >
                          {msg.content}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center pt-8">您的问题将显示在这里</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Textarea 
                      placeholder="输入您的问题..."
                      value={userQuestion}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserQuestion(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendQuestion} 
                      disabled={isLoading || !userQuestion.trim()}
                    >
                      发送
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="concept">
              <Card>
                <CardHeader>
                  <CardTitle>概念图谱</CardTitle>
                  <CardDescription>可视化展示关键概念间的关系</CardDescription>
                </CardHeader>
                <CardContent>
                  {conceptMap ? (
                    <div className="h-60 bg-gray-50 border rounded p-2 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-medium">概念图谱已生成</p>
                        <p className="text-sm text-gray-500">包含 {conceptMap.nodes.length} 个概念节点</p>
                        <ul className="mt-2 text-left">
                          {conceptMap.nodes.map((node: any) => (
                            <li key={node.id} className="text-sm">• {node.label}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="h-60 bg-gray-50 border rounded p-2 flex items-center justify-center">
                      <Button onClick={generateConceptMap} disabled={isLoading}>
                        生成概念图谱
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="memory">
              <Card>
                <CardHeader>
                  <CardTitle>记忆进度</CardTitle>
                  <CardDescription>基于艾宾浩斯记忆曲线的学习进度追踪</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">当前进度</span>
                      <span className="text-sm font-medium">{memoryProgress}%</span>
                    </div>
                    <Progress value={memoryProgress} className="w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>基础概念</span>
                      <span className="text-green-500 flex items-center">
                        <CheckCircle2 size={14} className="mr-1" />
                        完成
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>声调掌握</span>
                      <span className="text-green-500 flex items-center">
                        <CheckCircle2 size={14} className="mr-1" />
                        完成
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>汉字记忆</span>
                      <span className="text-blue-500">进行中 (42%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>语法规则</span>
                      <span className="text-blue-500">进行中 (28%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>量词应用</span>
                      <span className="text-gray-500">未开始</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 底部面板 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 智能摘要 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <FileText className="mr-2" size={20} />
              <CardTitle>智能摘要</CardTitle>
            </div>
            <CardDescription>自动生成的内容摘要</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{summary}</p>
          </CardContent>
        </Card>

        {/* 测试题入口 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <LightbulbIcon className="mr-2" size={20} />
              <CardTitle>测试与练习</CardTitle>
            </div>
            <CardDescription>根据学习内容生成的测试题</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-2">初级</span>
                声调辨识练习 (5题)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs mr-2">中级</span>
                汉字结构分析 (10题)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs mr-2">高级</span>
                量词搭配练习 (8题)
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">开始练习</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
