import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle, XCircle, Loader2, FileText, Target, TrendingDown, Star, Clock, ChevronDown, ChevronUp, Trash2, Edit3, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type CallAnalysis = Tables<'call_analysis'>;
type SalesCallAnalysis = any; // Используем any для sales_calls_analysis до обновления типов

const Index = () => {
  const [activeTab, setActiveTab] = useState("call-center");
  
  // Call Center States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<CallAnalysis | null>(null);
  const [analyses, setAnalyses] = useState<CallAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  
  // Sales States
  const [salesSearchTerm, setSalesSearchTerm] = useState("");
  const [selectedSalesItem, setSelectedSalesItem] = useState<SalesCallAnalysis | null>(null);
  const [salesAnalyses, setSalesAnalyses] = useState<SalesCallAnalysis[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesActiveFilter, setSalesActiveFilter] = useState<'all' | 'hot' | 'measured'>('all');
  
  // Selection and editing states for call center
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState<CallAnalysis | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Selection and editing states for sales
  const [salesSelectionMode, setSalesSelectionMode] = useState(false);
  const [salesSelectedItems, setSalesSelectedItems] = useState<Set<string>>(new Set());
  const [salesEditMode, setSalesEditMode] = useState(false);
  const [salesEditedItem, setSalesEditedItem] = useState<SalesCallAnalysis | null>(null);
  const [salesDeleteLoading, setSalesDeleteLoading] = useState(false);
  const [salesUpdateLoading, setSalesUpdateLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyses();
    fetchSalesAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('call_analysis')
        .select('*')
        .order('date_created', { ascending: false });

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить анализы звонков",
          variant: "destructive"
        });
        console.error('Error fetching call analysis:', error);
        return;
      }

      setAnalyses(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке данных",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesAnalyses = async () => {
    try {
      setSalesLoading(true);
      const { data, error } = await supabase
        .from('sales_calls_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить анализы продаж",
          variant: "destructive"
        });
        console.error('Error fetching sales analysis:', error);
        return;
      }

      setSalesAnalyses(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке данных продаж",
        variant: "destructive"
      });
    } finally {
      setSalesLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Дата не указана";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Не указано";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} мин ${remainingSeconds} сек`;
  };

  const getTonalityColor = (tonality: string | null) => {
    if (!tonality) return "bg-muted text-muted-foreground";
    const lower = tonality.toLowerCase();
    if (lower.includes('положительн') || lower.includes('дружелюбн')) return "bg-success/10 text-success border-success/20";
    if (lower.includes('раздражен') || lower.includes('агрессивн')) return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const getNpsColor = (category: string | null) => {
    if (!category) return "bg-muted text-muted-foreground";
    const lower = category.toLowerCase();
    if (lower.includes('промоутер')) return "bg-success/10 text-success border-success/20";
    if (lower.includes('критик')) return "bg-destructive/10 text-destructive border-destructive/20";
    if (lower.includes('пассивн')) return "bg-warning/10 text-warning border-warning/20";
    return "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const getWarmthColor = (warmth: string | null) => {
    if (!warmth) return "bg-muted text-muted-foreground";
    const lower = warmth.toLowerCase();
    if (lower.includes('горячий')) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (lower.includes('тёплый') || lower.includes('теплый')) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (lower.includes('холодный')) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const renderStarRating = (score: number | null, maxStars: number = 10) => {
    if (score === null) return <span className="text-muted-foreground">Не оценено</span>;
    
    let starColor = "text-destructive";
    
    if (maxStars === 5) {
      if (score === 5) {
        starColor = "text-success";
      } else if (score === 4) {
        starColor = "text-warning";
      }
    } else {
      if (score >= 8) {
        starColor = "text-success";
      } else if (score >= 5) {
        starColor = "text-warning";
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < score ? `fill-current ${starColor}` : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{score}/{maxStars}</span>
      </div>
    );
  };

  const renderStarRatingFrom100 = (score: number | null) => {
    if (score === null) return <span className="text-muted-foreground">Не оценено</span>;
    
    const stars = Math.round(score / 20); // Convert 0-100 to 0-5 stars
    let starColor = "text-destructive";
    
    if (score >= 80) {
      starColor = "text-success";
    } else if (score >= 60) {
      starColor = "text-warning";
    }
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < stars ? `fill-current ${starColor}` : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{score}/100</span>
      </div>
    );
  };

  // Call Center Metrics
  const metrics = useMemo(() => {
    const total = analyses.length;
    const successful = analyses.filter(t => t.goal_achieved).length;
    const failed = total - successful;
    
    return {
      total,
      successful,
      failed
    };
  }, [analyses]);

  // Sales Metrics
  const salesMetrics = useMemo(() => {
    const total = salesAnalyses.length;
    const hot = salesAnalyses.filter(t => t.client_warmth?.toLowerCase().includes('горячий')).length;
    const measured = salesAnalyses.filter(t => t.measurement_scheduled).length;
    
    return {
      total,
      hot,
      measured
    };
  }, [salesAnalyses]);

  // Call Center Filtered Data
  const filteredData = useMemo(() => {
    let filtered = analyses;
    
    if (activeFilter === 'success') {
      filtered = filtered.filter(item => item.goal_achieved);
    } else if (activeFilter === 'failed') {
      filtered = filtered.filter(item => !item.goal_achieved);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.call_goal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.final_conclusion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transcript?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [analyses, activeFilter, searchTerm]);

  // Sales Filtered Data
  const salesFilteredData = useMemo(() => {
    let filtered = salesAnalyses;
    
    if (salesActiveFilter === 'hot') {
      filtered = filtered.filter(item => item.client_warmth?.toLowerCase().includes('горячий'));
    } else if (salesActiveFilter === 'measured') {
      filtered = filtered.filter(item => item.measurement_scheduled);
    }
    
    if (salesSearchTerm) {
      filtered = filtered.filter(item =>
        item.object_type?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        item.client_requirements?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        item.client_emotion?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        item.client_warmth?.toLowerCase().includes(salesSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [salesAnalyses, salesActiveFilter, salesSearchTerm]);

  // CRUD Operations for Call Center
  const deleteSingleItem = async (id: string) => {
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from('call_analysis')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить анализ",
          variant: "destructive"
        });
        return;
      }

      setAnalyses(prev => prev.filter(item => item.id !== id));
      setSelectedItem(null);
      toast({
        title: "Успешно",
        description: "Анализ удален",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteMultipleItems = async (ids: string[]) => {
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from('call_analysis')
        .delete()
        .in('id', ids);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить выбранные анализы",
          variant: "destructive"
        });
        return;
      }

      setAnalyses(prev => prev.filter(item => !ids.includes(item.id)));
      setSelectedItems(new Set());
      setSelectionMode(false);
      toast({
        title: "Успешно",
        description: `Удалено ${ids.length} анализов`,
      });
    } catch (error) {
      console.error('Error deleting items:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<CallAnalysis>) => {
    try {
      setUpdateLoading(true);
      const { error } = await supabase
        .from('call_analysis')
        .update(updates)
        .eq('id', id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить анализ",
          variant: "destructive"
        });
        return;
      }

      setAnalyses(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
      setEditMode(false);
      setEditedItem(null);
      toast({
        title: "Успешно",
        description: "Анализ обновлен",
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении",
        variant: "destructive"
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // CRUD Operations for Sales
  const deleteSingleSalesItem = async (id: string) => {
    try {
      setSalesDeleteLoading(true);
      const { error } = await supabase
        .from('sales_calls_analysis')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить анализ продаж",
          variant: "destructive"
        });
        return;
      }

      setSalesAnalyses(prev => prev.filter(item => item.id !== id));
      setSelectedSalesItem(null);
      toast({
        title: "Успешно",
        description: "Анализ продаж удален",
      });
    } catch (error) {
      console.error('Error deleting sales item:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive"
      });
    } finally {
      setSalesDeleteLoading(false);
    }
  };

  const deleteMultipleSalesItems = async (ids: string[]) => {
    try {
      setSalesDeleteLoading(true);
      const { error } = await supabase
        .from('sales_calls_analysis')
        .delete()
        .in('id', ids);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить выбранные анализы продаж",
          variant: "destructive"
        });
        return;
      }

      setSalesAnalyses(prev => prev.filter(item => !ids.includes(item.id)));
      setSalesSelectedItems(new Set());
      setSalesSelectionMode(false);
      toast({
        title: "Успешно",
        description: `Удалено ${ids.length} анализов продаж`,
      });
    } catch (error) {
      console.error('Error deleting sales items:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive"
      });
    } finally {
      setSalesDeleteLoading(false);
    }
  };

  const updateSalesItem = async (id: string, updates: Partial<SalesCallAnalysis>) => {
    try {
      setSalesUpdateLoading(true);
      const { error } = await supabase
        .from('sales_calls_analysis')
        .update(updates)
        .eq('id', id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить анализ продаж",
          variant: "destructive"
        });
        return;
      }

      setSalesAnalyses(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      setSelectedSalesItem(prev => prev ? { ...prev, ...updates } : null);
      setSalesEditMode(false);
      setSalesEditedItem(null);
      toast({
        title: "Успешно",
        description: "Анализ продаж обновлен",
      });
    } catch (error) {
      console.error('Error updating sales item:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении",
        variant: "destructive"
      });
    } finally {
      setSalesUpdateLoading(false);
    }
  };

  // Selection helpers for Call Center
  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredData.map(item => item.id)));
    }
  };

  // Selection helpers for Sales
  const handleSelectSalesItem = (id: string) => {
    const newSelected = new Set(salesSelectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSalesSelectedItems(newSelected);
  };

  const handleSelectAllSales = () => {
    if (salesSelectedItems.size === salesFilteredData.length) {
      setSalesSelectedItems(new Set());
    } else {
      setSalesSelectedItems(new Set(salesFilteredData.map(item => item.id)));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">Анализ звонков</h1>
        <p className="text-muted-foreground">
          Комплексный анализ качества обслуживания клиентов
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="call-center">Анализ звонков колл-центра</TabsTrigger>
          <TabsTrigger value="sales">Анализ звонков отдела продаж</TabsTrigger>
        </TabsList>

        <TabsContent value="call-center" className="space-y-6">
          {/* Call Center Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего анализов</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Успешные</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{metrics.successful}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.total > 0 ? Math.round((metrics.successful / metrics.total) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Неуспешные</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{metrics.failed}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.total > 0 ? Math.round((metrics.failed / metrics.total) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call Center Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск по цели звонка, заключению или транскрипции..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={activeFilter} onValueChange={(value: 'all' | 'success' | 'failed') => setActiveFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все анализы</SelectItem>
                  <SelectItem value="success">Успешные</SelectItem>
                  <SelectItem value="failed">Неуспешные</SelectItem>
                </SelectContent>
              </Select>
              
              {!selectionMode ? (
                <Button
                  variant="outline"
                  onClick={() => setSelectionMode(true)}
                  disabled={filteredData.length === 0}
                >
                  Выбрать
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    size="sm"
                  >
                    {selectedItems.size === filteredData.length ? "Снять всё" : "Выбрать всё"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedItems(new Set());
                    }}
                    size="sm"
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Call Center Delete Button */}
          {selectionMode && selectedItems.size > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full shadow-lg"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-5 w-5 mr-2" />
                    )}
                    Удалить ({selectedItems.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы действительно хотите удалить {selectedItems.size} выбранных анализов? 
                      Это действие нельзя отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMultipleItems(Array.from(selectedItems))}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Call Center Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Загрузка анализов...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Анализы не найдены</p>
            </div>
          ) : (
            /* Call Center Cards */
            <div className="grid gap-4">
              {filteredData.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectionMode ? "hover:bg-muted/50" : ""
                  } ${
                    selectedItems.has(item.id) ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (selectionMode) {
                      handleSelectItem(item.id);
                    } else {
                      setSelectedItem(item);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {item.call_goal || "Цель не указана"}
                            {item.goal_achieved ? (
                              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {formatDate(item.date_created)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Общая оценка</p>
                      {renderStarRating(item.overall_score)}
                    </div>

                    {item.operator_tonality && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Тональность оператора</p>
                        <Badge className={getTonalityColor(item.operator_tonality)}>
                          {item.operator_tonality}
                        </Badge>
                      </div>
                    )}

                    {item.client_nps_category && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Категория NPS</p>
                        <Badge className={getNpsColor(item.client_nps_category)}>
                          {item.client_nps_category}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего лидов</CardTitle>
                <span className="text-lg">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesMetrics.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Горячие лиды</CardTitle>
                <span className="text-lg">🔥</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{salesMetrics.hot}</div>
                <p className="text-xs text-muted-foreground">
                  {salesMetrics.total > 0 ? Math.round((salesMetrics.hot / salesMetrics.total) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Записались на замер</CardTitle>
                <span className="text-lg">✅</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{salesMetrics.measured}</div>
                <p className="text-xs text-muted-foreground">
                  {salesMetrics.total > 0 ? Math.round((salesMetrics.measured / salesMetrics.total) * 100) : 0}% от общего числа
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск по объекту, требованиям, эмоциям..."
                value={salesSearchTerm}
                onChange={(e) => setSalesSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={salesActiveFilter} onValueChange={(value: 'all' | 'hot' | 'measured') => setSalesActiveFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все лиды</SelectItem>
                  <SelectItem value="hot">Горячие лиды</SelectItem>
                  <SelectItem value="measured">Записались на замер</SelectItem>
                </SelectContent>
              </Select>
              
              {!salesSelectionMode ? (
                <Button
                  variant="outline"
                  onClick={() => setSalesSelectionMode(true)}
                  disabled={salesFilteredData.length === 0}
                >
                  Выбрать
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSelectAllSales}
                    size="sm"
                  >
                    {salesSelectedItems.size === salesFilteredData.length ? "Снять всё" : "Выбрать всё"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSalesSelectionMode(false);
                      setSalesSelectedItems(new Set());
                    }}
                    size="sm"
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sales Delete Button */}
          {salesSelectionMode && salesSelectedItems.size > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full shadow-lg"
                    disabled={salesDeleteLoading}
                  >
                    {salesDeleteLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-5 w-5 mr-2" />
                    )}
                    Удалить ({salesSelectedItems.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы действительно хотите удалить {salesSelectedItems.size} выбранных анализов продаж? 
                      Это действие нельзя отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMultipleSalesItems(Array.from(salesSelectedItems))}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Sales Loading */}
          {salesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Загрузка анализов продаж...</span>
            </div>
          ) : salesFilteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Анализы продаж не найдены</p>
            </div>
          ) : (
            /* Sales Cards */
            <div className="grid gap-4">
              {salesFilteredData.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    salesSelectionMode ? "hover:bg-muted/50" : ""
                  } ${
                    salesSelectedItems.has(item.id) ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (salesSelectionMode) {
                      handleSelectSalesItem(item.id);
                    } else {
                      setSelectedSalesItem(item);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {salesSelectionMode && (
                          <Checkbox
                            checked={salesSelectedItems.has(item.id)}
                            onChange={() => handleSelectSalesItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {item.object_type || "Тип объекта не указан"}
                            {item.measurement_scheduled && (
                              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(item.call_duration_seconds)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Общая оценка</p>
                      {renderStarRatingFrom100(item.total_score)}
                    </div>

                    {item.client_emotion && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Эмоциональная оценка</p>
                        <Badge className={getTonalityColor(item.client_emotion)}>
                          {item.client_emotion}
                        </Badge>
                      </div>
                    )}

                    {item.client_warmth && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Категория клиента</p>
                        <Badge className={getWarmthColor(item.client_warmth)}>
                          {item.client_warmth}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Call Center Detail Sheet */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl">
                    {selectedItem.call_goal || "Анализ звонка"}
                  </SheetTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditMode(true);
                        setEditedItem({ ...selectedItem });
                      }}
                      disabled={editMode || updateLoading}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы действительно хотите удалить этот анализ? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteSingleItem(selectedItem.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(selectedItem.date_created)}</span>
                  {selectedItem.goal_achieved ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      Цель достигнута
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      Цель не достигнута
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              {editMode ? (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium">Цель звонка</label>
                    <Textarea
                      value={editedItem?.call_goal || ''}
                      onChange={(e) => setEditedItem(prev => prev ? { ...prev, call_goal: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Заключение</label>
                    <Textarea
                      value={editedItem?.final_conclusion || ''}
                      onChange={(e) => setEditedItem(prev => prev ? { ...prev, final_conclusion: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Общая оценка (0-10)</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={editedItem?.overall_score || 0}
                      onChange={(e) => setEditedItem(prev => prev ? { ...prev, overall_score: parseInt(e.target.value) || 0 } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (editedItem) {
                          updateItem(selectedItem.id, {
                            call_goal: editedItem.call_goal,
                            final_conclusion: editedItem.final_conclusion,
                            overall_score: editedItem.overall_score
                          });
                        }
                      }}
                      disabled={updateLoading}
                      className="flex-1"
                    >
                      {updateLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        setEditedItem(null);
                      }}
                      disabled={updateLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Общая оценка</p>
                      {renderStarRating(selectedItem.overall_score)}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Активное слушание</p>
                      {renderStarRating(selectedItem.active_listening_score)}
                    </div>
                  </div>

                  {selectedItem.operator_tonality && (
                    <div>
                      <p className="text-sm font-medium mb-2">Тональность оператора</p>
                      <Badge className={getTonalityColor(selectedItem.operator_tonality)}>
                        {selectedItem.operator_tonality}
                      </Badge>
                    </div>
                  )}

                  {selectedItem.final_conclusion && (
                    <div>
                      <p className="text-sm font-medium mb-2">Заключение</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {selectedItem.final_conclusion}
                      </p>
                    </div>
                  )}

                  {selectedItem.transcript && (
                    <Collapsible open={transcriptExpanded} onOpenChange={setTranscriptExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between">
                          <span>Транскрипция</span>
                          {transcriptExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <div className="bg-muted/50 p-4 rounded text-sm max-h-60 overflow-y-auto">
                          {selectedItem.transcript}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Sales Detail Sheet */}
      <Sheet open={!!selectedSalesItem} onOpenChange={(open) => !open && setSelectedSalesItem(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedSalesItem && (
            <>
              <SheetHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl">
                    {selectedSalesItem.object_type || "Анализ продаж"}
                  </SheetTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSalesEditMode(true);
                        setSalesEditedItem({ ...selectedSalesItem });
                      }}
                      disabled={salesEditMode || salesUpdateLoading}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы действительно хотите удалить этот анализ продаж? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteSingleSalesItem(selectedSalesItem.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(selectedSalesItem.created_at)}</span>
                  <span>{formatDuration(selectedSalesItem.call_duration_seconds)}</span>
                  {selectedSalesItem.measurement_scheduled && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      Записался на замер
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              {salesEditMode ? (
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium">Тип объекта</label>
                    <Input
                      value={salesEditedItem?.object_type || ''}
                      onChange={(e) => setSalesEditedItem(prev => prev ? { ...prev, object_type: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Количество конструкций</label>
                    <Input
                      value={salesEditedItem?.construction_count || ''}
                      onChange={(e) => setSalesEditedItem(prev => prev ? { ...prev, construction_count: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Когда нужны окна</label>
                    <Input
                      value={salesEditedItem?.window_needed_when || ''}
                      onChange={(e) => setSalesEditedItem(prev => prev ? { ...prev, window_needed_when: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="measurement_scheduled"
                      checked={salesEditedItem?.measurement_scheduled || false}
                      onCheckedChange={(checked) => setSalesEditedItem(prev => prev ? { ...prev, measurement_scheduled: checked as boolean } : null)}
                    />
                    <label htmlFor="measurement_scheduled" className="text-sm font-medium">
                      Записался на замер
                    </label>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Требования клиента</label>
                    <Textarea
                      value={salesEditedItem?.client_requirements || ''}
                      onChange={(e) => setSalesEditedItem(prev => prev ? { ...prev, client_requirements: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Эмоциональная оценка</label>
                    <Select
                      value={salesEditedItem?.client_emotion || ''}
                      onValueChange={(value) => setSalesEditedItem(prev => prev ? { ...prev, client_emotion: value } : null)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="положительная">Положительная</SelectItem>
                        <SelectItem value="нейтральная">Нейтральная</SelectItem>
                        <SelectItem value="негативная">Негативная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Температура клиента</label>
                    <Select
                      value={salesEditedItem?.client_warmth || ''}
                      onValueChange={(value) => setSalesEditedItem(prev => prev ? { ...prev, client_warmth: value } : null)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="горячий">Горячий</SelectItem>
                        <SelectItem value="тёплый">Тёплый</SelectItem>
                        <SelectItem value="холодный">Холодный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (salesEditedItem) {
                          updateSalesItem(selectedSalesItem.id, {
                            object_type: salesEditedItem.object_type,
                            construction_count: salesEditedItem.construction_count,
                            window_needed_when: salesEditedItem.window_needed_when,
                            measurement_scheduled: salesEditedItem.measurement_scheduled,
                            client_requirements: salesEditedItem.client_requirements,
                            client_emotion: salesEditedItem.client_emotion,
                            client_warmth: salesEditedItem.client_warmth
                          });
                        }
                      }}
                      disabled={salesUpdateLoading}
                      className="flex-1"
                    >
                      {salesUpdateLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSalesEditMode(false);
                        setSalesEditedItem(null);
                      }}
                      disabled={salesUpdateLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Общая оценка</p>
                      {renderStarRatingFrom100(selectedSalesItem.total_score)}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Длительность звонка</p>
                      <p className="text-sm">{formatDuration(selectedSalesItem.call_duration_seconds)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Количество конструкций</p>
                      <p className="text-sm">{selectedSalesItem.construction_count || "Не указано"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Когда нужны окна</p>
                      <p className="text-sm">{selectedSalesItem.window_needed_when || "Не указано"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Записался на замер</p>
                    <Badge className={selectedSalesItem.measurement_scheduled ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                      {selectedSalesItem.measurement_scheduled ? "Да" : "Нет"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Следующий контакт</p>
                    <p className="text-sm">{selectedSalesItem.next_contact_date || "Не указано"}</p>
                    <p className="text-sm text-muted-foreground">{selectedSalesItem.next_contact_method || ""}</p>
                  </div>

                  {selectedSalesItem.client_requirements && (
                    <div>
                      <p className="text-sm font-medium mb-2">Требования клиента</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {selectedSalesItem.client_requirements}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedSalesItem.client_emotion && (
                      <div>
                        <p className="text-sm font-medium mb-2">Эмоциональная оценка</p>
                        <Badge className={getTonalityColor(selectedSalesItem.client_emotion)}>
                          {selectedSalesItem.client_emotion}
                        </Badge>
                      </div>
                    )}

                    {selectedSalesItem.client_warmth && (
                      <div>
                        <p className="text-sm font-medium mb-2">Температура клиента</p>
                        <Badge className={getWarmthColor(selectedSalesItem.client_warmth)}>
                          {selectedSalesItem.client_warmth}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Балл за объект</p>
                      <p>{selectedSalesItem.object_score || "Не оценено"}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Балл за конструкции</p>
                      <p>{selectedSalesItem.construction_score || "Не оценено"}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Балл за тайминг</p>
                      <p>{selectedSalesItem.timing_score || "Не оценено"}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Балл за замер</p>
                      <p>{selectedSalesItem.measurement_score || "Не оценено"}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Эмоциональный балл</p>
                      <p>{selectedSalesItem.emotion_score || "Не оценено"}</p>
                    </div>
                  </div>

                  {selectedSalesItem.transcript_text && (
                    <Collapsible open={transcriptExpanded} onOpenChange={setTranscriptExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between">
                          <span>Транскрипция</span>
                          {transcriptExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <div className="bg-muted/50 p-4 rounded text-sm max-h-60 overflow-y-auto">
                          {selectedSalesItem.transcript_text}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
