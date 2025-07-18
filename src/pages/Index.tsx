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
type SalesCallAnalysis = Tables<'sales_calls_analysis'>;

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
        .from('sales_call_analysis')
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
        .from('sales_call_analysis')
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
        .from('sales_call_analysis')
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
        .from('sales_call_analysis')
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

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems(new Set());
  };

  const startEdit = () => {
    if (selectedItem) {
      setEditedItem({ ...selectedItem });
      setEditMode(true);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedItem(null);
  };

  const saveEdit = () => {
    if (editedItem && selectedItem) {
      updateItem(selectedItem.id, editedItem);
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

  const toggleSalesSelectionMode = () => {
    setSalesSelectionMode(!salesSelectionMode);
    setSalesSelectedItems(new Set());
  };

  const startSalesEdit = () => {
    if (selectedSalesItem) {
      setSalesEditedItem({ ...selectedSalesItem });
      setSalesEditMode(true);
    }
  };

  const cancelSalesEdit = () => {
    setSalesEditMode(false);
    setSalesEditedItem(null);
  };

  const saveSalesEdit = () => {
    if (salesEditedItem && selectedSalesItem) {
      updateSalesItem(selectedSalesItem.id, salesEditedItem);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Фиксированная шапка */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-light mb-2">EntechAI: Анализ звонков</h1>
            <p className="text-muted-foreground font-light">Просмотр и анализ качества телефонных разговоров</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="call-center">Анализ звонков колл-центра</TabsTrigger>
              <TabsTrigger value="sales">Анализ звонков отдела продаж</TabsTrigger>
            </TabsList>
            
            <TabsContent value="call-center" className="mt-6">
              {/* Call Center Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm ${
                    activeFilter === 'all' ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                  }`}
                  onClick={() => setActiveFilter('all')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">📊 Всего</p>
                        <p className="text-2xl font-bold">{metrics.total}</p>
                      </div>
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm ${
                    activeFilter === 'success' ? 'ring-2 ring-success/20 bg-success/5' : ''
                  }`}
                  onClick={() => setActiveFilter('success')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">✅ Успешные</p>
                        <p className="text-2xl font-bold text-success">{metrics.successful}</p>
                      </div>
                      <Target className="h-8 w-8 text-success" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm ${
                    activeFilter === 'failed' ? 'ring-2 ring-destructive/20 bg-destructive/5' : ''
                  }`}
                  onClick={() => setActiveFilter('failed')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">❌ Неуспешные</p>
                        <p className="text-2xl font-bold text-destructive">{metrics.failed}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call Center Search and Actions */}
              <div className="flex gap-4 items-center mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Поиск по цели звонка, выводам или транскрипции..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 shadow-sm"
                  />
                </div>
                
                <Button
                  variant={selectionMode ? "default" : "outline"}
                  onClick={toggleSelectionMode}
                  className="flex items-center gap-2"
                >
                  <Checkbox checked={selectionMode} onChange={() => {}} />
                  {selectionMode ? "Отменить выбор" : "Выбрать"}
                </Button>
                
                {selectionMode && (
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2"
                  >
                    {selectedItems.size === filteredData.length ? "Отменить все" : "Выбрать все"}
                  </Button>
                )}
              </div>

              {/* Call Center Content */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Загрузка анализов звонков...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.map((item) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm ${
                          selectedItems.has(item.id) ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                        }`}
                        onClick={(e) => {
                          if (selectionMode) {
                            e.stopPropagation();
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
                                  onCheckedChange={() => handleSelectItem(item.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <CardTitle className="text-lg font-medium line-clamp-2">
                                {item.call_goal || "Цель не указана"}
                              </CardTitle>
                            </div>
                            {item.goal_achieved ? (
                              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{item.conversation_duration_total || "Не указано"}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Общая оценка</p>
                            {renderStarRating(item.overall_score)}
                          </div>

                          {item.operator_tonality && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Тональность</p>
                              <Badge className={getTonalityColor(item.operator_tonality)}>
                                {item.operator_tonality}
                              </Badge>
                            </div>
                          )}

                          {item.client_nps_category && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Категория клиента</p>
                              <Badge className={getNpsColor(item.client_nps_category)}>
                                {item.client_nps_category}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredData.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground font-light">
                        {analyses.length === 0
                          ? "Нет анализов для отображения"
                          : "По вашему запросу ничего не найдено"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="sales" className="mt-6">
              {/* Sales Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm ${
                    salesActiveFilter === 'all' ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                  }`}
                  onClick={() => setSalesActiveFilter('all')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">📊 Всего лидов</p>
                        <p className="text-2xl font-bold">{salesMetrics.total}</p>
                      </div>
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm ${
                    salesActiveFilter === 'hot' ? 'ring-2 ring-red-500/20 bg-red-500/5' : ''
                  }`}
                  onClick={() => setSalesActiveFilter('hot')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">🔥 Горячие лиды</p>
                        <p className="text-2xl font-bold text-red-500">{salesMetrics.hot}</p>
                      </div>
                      <span className="text-2xl">🔥</span>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm ${
                    salesActiveFilter === 'measured' ? 'ring-2 ring-success/20 bg-success/5' : ''
                  }`}
                  onClick={() => setSalesActiveFilter('measured')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">✅ Записались на замер</p>
                        <p className="text-2xl font-bold text-success">{salesMetrics.measured}</p>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Search and Actions */}
              <div className="flex gap-4 items-center mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Поиск по типу объекта, температуре клиента, требованиям..."
                    value={salesSearchTerm}
                    onChange={(e) => setSalesSearchTerm(e.target.value)}
                    className="pl-10 border-0 shadow-sm"
                  />
                </div>
                
                <Button
                  variant={salesSelectionMode ? "default" : "outline"}
                  onClick={toggleSalesSelectionMode}
                  className="flex items-center gap-2"
                >
                  <Checkbox checked={salesSelectionMode} onChange={() => {}} />
                  {salesSelectionMode ? "Отменить выбор" : "Выбрать"}
                </Button>
                
                {salesSelectionMode && (
                  <Button
                    variant="outline"
                    onClick={handleSelectAllSales}
                    className="flex items-center gap-2"
                  >
                    {salesSelectedItems.size === salesFilteredData.length ? "Отменить все" : "Выбрать все"}
                  </Button>
                )}
              </div>

              {/* Sales Content */}
              {salesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Загрузка анализов продаж...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {salesFilteredData.map((item) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm ${
                          salesSelectedItems.has(item.id) ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                        }`}
                        onClick={(e) => {
                          if (salesSelectionMode) {
                            e.stopPropagation();
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
                                  onCheckedChange={() => handleSelectSalesItem(item.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <CardTitle className="text-lg font-medium line-clamp-2">
                                {item.object_type || "Тип объекта не указан"}
                              </CardTitle>
                            </div>
                            {item.measurement_scheduled ? (
                              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(item.call_duration_seconds)}</span>
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
                              <p className="text-xs text-muted-foreground mb-1">Температура клиента</p>
                              <Badge className={getWarmthColor(item.client_warmth)}>
                                {item.client_warmth}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {salesFilteredData.length === 0 && !salesLoading && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground font-light">
                        {salesAnalyses.length === 0
                          ? "Нет анализов продаж для отображения"
                          : "По вашему запросу ничего не найдено"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Action Buttons */}
      {selectionMode && selectedItems.size > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="lg"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg"
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
                <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить {selectedItems.size} выбранных анализов? Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMultipleItems(Array.from(selectedItems))}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {salesSelectionMode && salesSelectedItems.size > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="lg"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg"
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
                <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить {salesSelectedItems.size} выбранных анализов продаж? Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMultipleSalesItems(Array.from(salesSelectedItems))}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Call Center Side Panel */}
      <Sheet open={!!selectedItem} onOpenChange={() => {
        setSelectedItem(null);
        setTranscriptExpanded(false);
        setEditMode(false);
        setEditedItem(null);
      }}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px] overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    {editMode ? "Редактирование анализа" : selectedItem.call_goal || "Анализ звонка"}
                    {!editMode && (selectedItem.goal_achieved ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Цель достигнута
                      </Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Цель не достигнута
                      </Badge>
                    ))}
                  </SheetTitle>
                  
                  {!editMode && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={startEdit}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={deleteLoading}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить этот анализ? Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSingleItem(selectedItem.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  
                  {editMode && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Отмена
                      </Button>
                      <Button size="sm" onClick={saveEdit} disabled={updateLoading}>
                        {updateLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Сохранить
                      </Button>
                    </div>
                  )}
                </div>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Call Center Edit/View Content */}
                <div>
                  <p className="text-muted-foreground">Содержимое панели колл-центра - сохранить существующий код</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Sales Side Panel */}
      <Sheet open={!!selectedSalesItem} onOpenChange={() => {
        setSelectedSalesItem(null);
        setSalesEditMode(false);
        setSalesEditedItem(null);
      }}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px] overflow-y-auto">
          {selectedSalesItem && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    {salesEditMode ? "Редактирование анализа продаж" : selectedSalesItem.object_type || "Анализ продаж"}
                    {!salesEditMode && (selectedSalesItem.measurement_scheduled ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Записался на замер
                      </Badge>
                    ) : (
                      <Badge className="bg-muted/10 text-muted-foreground border-muted/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Не записался
                      </Badge>
                    ))}
                  </SheetTitle>
                  
                  {!salesEditMode && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={startSalesEdit}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={salesDeleteLoading}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить этот анализ продаж? Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSingleSalesItem(selectedSalesItem.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  
                  {salesEditMode && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={cancelSalesEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Отмена
                      </Button>
                      <Button size="sm" onClick={saveSalesEdit} disabled={salesUpdateLoading}>
                        {salesUpdateLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Сохранить
                      </Button>
                    </div>
                  )}
                </div>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {salesEditMode && salesEditedItem ? (
                  /* Sales Edit Mode */
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Основная информация</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Тип объекта</label>
                          <Input
                            value={salesEditedItem.object_type || ''}
                            onChange={(e) => setSalesEditedItem({...salesEditedItem, object_type: e.target.value})}
                            placeholder="Введите тип объекта"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Количество конструкций</label>
                          <Input
                            value={salesEditedItem.construction_count || ''}
                            onChange={(e) => setSalesEditedItem({...salesEditedItem, construction_count: e.target.value})}
                            placeholder="Введите количество конструкций"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Когда нужны окна</label>
                          <Input
                            value={salesEditedItem.window_needed_when || ''}
                            onChange={(e) => setSalesEditedItem({...salesEditedItem, window_needed_when: e.target.value})}
                            placeholder="Когда нужны окна"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={salesEditedItem.measurement_scheduled || false}
                            onCheckedChange={(checked) => setSalesEditedItem({...salesEditedItem, measurement_scheduled: checked as boolean})}
                          />
                          <label className="text-sm font-medium">Записался на замер</label>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Дата следующего контакта</label>
                          <Input
                            value={salesEditedItem.next_contact_date || ''}
                            onChange={(e) => setSalesEditedItem({...salesEditedItem, next_contact_date: e.target.value})}
                            placeholder="Дата следующего контакта"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Способ следующего контакта</label>
                          <Input
                            value={salesEditedItem.next_contact_method || ''}
                            onChange={(e) => setSalesEditedItem({...salesEditedItem, next_contact_method: e.target.value})}
                            placeholder="Способ контакта"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Требования клиента</label>
                          <Textarea
                            value={salesEditedItem.client_requirements || ''}
                            onChange={(e) => setSalesEditedItem({...salesEditedItem, client_requirements: e.target.value})}
                            placeholder="Требования клиента"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Эмоциональная оценка</label>
                          <Select 
                            value={salesEditedItem.client_emotion || ''} 
                            onValueChange={(value) => setSalesEditedItem({...salesEditedItem, client_emotion: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите эмоцию" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Позитивная">Позитивная</SelectItem>
                              <SelectItem value="Нейтральная">Нейтральная</SelectItem>
                              <SelectItem value="Негативная">Негативная</SelectItem>
                              <SelectItem value="Заинтересованная">Заинтересованная</SelectItem>
                              <SelectItem value="Скептическая">Скептическая</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Температура клиента</label>
                          <Select 
                            value={salesEditedItem.client_warmth || ''} 
                            onValueChange={(value) => setSalesEditedItem({...salesEditedItem, client_warmth: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите температуру" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="горячий">Горячий</SelectItem>
                              <SelectItem value="тёплый">Тёплый</SelectItem>
                              <SelectItem value="холодный">Холодный</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Оценки</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'object_score', label: 'Оценка объекта' },
                          { key: 'construction_score', label: 'Оценка конструкций' },
                          { key: 'timing_score', label: 'Оценка сроков' },
                          { key: 'measurement_score', label: 'Оценка замера' },
                          { key: 'emotion_score', label: 'Оценка эмоций' },
                          { key: 'total_score', label: 'Общая оценка' }
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className="text-sm font-medium mb-2 block">{label}</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={salesEditedItem[key as keyof SalesCallAnalysis] as number || ''}
                              onChange={(e) => setSalesEditedItem({
                                ...salesEditedItem, 
                                [key]: e.target.value ? parseInt(e.target.value) : null
                              })}
                              placeholder="0-100"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Sales View Mode */
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Информация о звонке</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Тип объекта</h4>
                          <p className="text-sm bg-muted p-3 rounded-md">{selectedSalesItem.object_type || "Не указан"}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Длительность звонка</h4>
                          <p className="text-sm bg-muted p-3 rounded-md">{formatDuration(selectedSalesItem.call_duration_seconds)}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Количество конструкций</h4>
                          <p className="text-sm bg-muted p-3 rounded-md">{selectedSalesItem.construction_count || "Не указано"}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Когда нужны окна</h4>
                          <p className="text-sm bg-muted p-3 rounded-md">{selectedSalesItem.window_needed_when || "Не указано"}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Записался на замер</h4>
                          <Badge className={selectedSalesItem.measurement_scheduled ? "bg-success/10 text-success border-success/20" : "bg-muted/10 text-muted-foreground border-muted/20"}>
                            {selectedSalesItem.measurement_scheduled ? "Да" : "Нет"}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Следующий контакт</h4>
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {selectedSalesItem.next_contact_date && selectedSalesItem.next_contact_method 
                              ? `${selectedSalesItem.next_contact_date} (${selectedSalesItem.next_contact_method})`
                              : "Не запланирован"}
                          </p>
                        </div>
                      </div>

                      {selectedSalesItem.client_requirements && (
                        <div>
                          <h4 className="font-medium mb-2">Требования клиента</h4>
                          <p className="text-sm bg-muted p-3 rounded-md">{selectedSalesItem.client_requirements}</p>
                        </div>
                      )}

                      {selectedSalesItem.client_emotion && (
                        <div>
                          <h4 className="font-medium mb-2">Эмоциональная оценка</h4>
                          <Badge className={getTonalityColor(selectedSalesItem.client_emotion)}>
                            {selectedSalesItem.client_emotion}
                          </Badge>
                        </div>
                      )}

                      {selectedSalesItem.client_warmth && (
                        <div>
                          <h4 className="font-medium mb-2">Температура клиента</h4>
                          <Badge className={getWarmthColor(selectedSalesItem.client_warmth)}>
                            {selectedSalesItem.client_warmth}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Оценки</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'object_score', label: 'Оценка объекта' },
                          { key: 'construction_score', label: 'Оценка конструкций' },
                          { key: 'timing_score', label: 'Оценка сроков' },
                          { key: 'measurement_score', label: 'Оценка замера' },
                          { key: 'emotion_score', label: 'Оценка эмоций' },
                          { key: 'total_score', label: 'Общая оценка' }
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <h4 className="font-medium mb-2">{label}</h4>
                            <div className="bg-muted p-3 rounded-md">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {selectedSalesItem[key as keyof SalesCallAnalysis] as number || 0}/100
                                </span>
                                <Progress 
                                  value={selectedSalesItem[key as keyof SalesCallAnalysis] as number || 0} 
                                  className="w-20" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedSalesItem.transcript_text && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Транскрипция</h3>
                        <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap font-mono">{selectedSalesItem.transcript_text}</pre>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
