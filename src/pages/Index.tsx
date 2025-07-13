import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, CheckCircle, XCircle, Loader2, FileText, Target, TrendingDown, Star, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type CallAnalysis = Tables<'call_analysis'>;

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<CallAnalysis | null>(null);
  const [analyses, setAnalyses] = useState<CallAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyses();
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

  const renderStarRating = (score: number | null, maxStars: number = 10) => {
    if (score === null) return <span className="text-muted-foreground">Не оценено</span>;
    
    // Определяем цвет звездочек в зависимости от оценки и типа шкалы
    let starColor = "text-destructive"; // красный по умолчанию
    
    if (maxStars === 5) {
      // Логика для 5-звездочных шкал (полнота ответа и активное слушание)
      if (score === 5) {
        starColor = "text-success"; // зеленый для 5
      } else if (score === 4) {
        starColor = "text-warning"; // желтый для 4
      }
      // 0-3 остаются красными
    } else {
      // Логика для 10-звездочных шкал (общая оценка)
      if (score >= 8) {
        starColor = "text-success"; // зеленый для оценки >= 8
      } else if (score >= 5) {
        starColor = "text-warning"; // желтый для оценки >= 5
      }
      // < 5 остаются красными
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

  const filteredData = useMemo(() => {
    let filtered = analyses;
    
    // Apply goal filter
    if (activeFilter === 'success') {
      filtered = filtered.filter(item => item.goal_achieved);
    } else if (activeFilter === 'failed') {
      filtered = filtered.filter(item => !item.goal_achieved);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.call_goal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.final_conclusion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transcript?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [analyses, activeFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      {/* Фиксированная шапка */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-light mb-2">EntechAI: Анализ звонков</h1>
            <p className="text-muted-foreground font-light">Просмотр и анализ качества телефонных разговоров</p>
          </div>

          {/* Метрики */}
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
                    <p className="text-sm font-medium text-muted-foreground">Всего</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Успешные</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Неуспешные</p>
                    <p className="text-2xl font-bold text-destructive">{metrics.failed}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск по цели звонка, выводам или транскрипции..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto p-6">
        {/* Состояние загрузки */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Загрузка анализов звонков...</span>
          </div>
        ) : (
          <>
            {/* Карточки */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 shadow-sm"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-medium line-clamp-2">
                        {item.call_goal || "Цель не указана"}
                      </CardTitle>
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
                    {/* Общая оценка */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Общая оценка</p>
                      {renderStarRating(item.overall_score)}
                    </div>

                    {/* Тональность оператора */}
                    {item.operator_tonality && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Тональность</p>
                        <Badge className={getTonalityColor(item.operator_tonality)}>
                          {item.operator_tonality}
                        </Badge>
                      </div>
                    )}

                    {/* Категория клиента */}
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
      </div>

      {/* Слайд-панель */}
      <Sheet open={!!selectedItem} onOpenChange={() => {
        setSelectedItem(null);
        setTranscriptExpanded(false);
      }}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px] overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedItem.call_goal || "Анализ звонка"}
                  {selectedItem.goal_achieved ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Цель достигнута
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                      <XCircle className="h-3 w-3 mr-1" />
                      Цель не достигнута
                    </Badge>
                  )}
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Оценки */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Оценки</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Общая оценка</h4>
                      {renderStarRating(selectedItem.overall_score)}
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Полнота ответа</h4>
                      {renderStarRating(selectedItem.answer_completeness_score, 5)}
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Активное слушание</h4>
                      {renderStarRating(selectedItem.active_listening_score, 5)}
                    </div>
                  </div>
                </div>

                {/* Коммуникация */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Коммуникация</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {selectedItem.greeting_correct ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm">Приветствие</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedItem.operator_said_name ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm">Назвал имя</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedItem.operator_thanked ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm">Благодарность</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedItem.closing_correct ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm">Прощание</span>
                    </div>
                  </div>

                  {selectedItem.operator_tonality && (
                    <div>
                      <h4 className="font-medium mb-2">Тональность оператора</h4>
                      <Badge className={getTonalityColor(selectedItem.operator_tonality)}>
                        {selectedItem.operator_tonality}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Риски */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Риски</h3>
                  
                  {selectedItem.burnout_signs && (
                    <div>
                      <h4 className="font-medium mb-2">Признаки выгорания</h4>
                      <p className="text-sm bg-muted p-3 rounded-md">{selectedItem.burnout_signs}</p>
                    </div>
                  )}

                  {selectedItem.conflict_moments && (
                    <div>
                      <h4 className="font-medium mb-2">Конфликтные моменты</h4>
                      <p className="text-sm bg-muted p-3 rounded-md">{selectedItem.conflict_moments}</p>
                      {selectedItem.conflict_risk_level && (
                        <Badge className="mt-2 bg-warning/10 text-warning border-warning/20">
                          Уровень риска: {selectedItem.conflict_risk_level}
                        </Badge>
                      )}
                    </div>
                  )}

                  {selectedItem.communication_issues && (
                    <div>
                      <h4 className="font-medium mb-2">Проблемы в общении</h4>
                      <p className="text-sm bg-muted p-3 rounded-md">{selectedItem.communication_issues}</p>
                    </div>
                  )}
                </div>

                {/* Оценка оператора */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Оценка оператора</h3>
                  
                  <div className="space-y-4">
                    {selectedItem.operator_strength && (
                      <div>
                        <h4 className="font-medium mb-2 text-success">Сильные стороны</h4>
                        <p className="text-sm bg-success/5 p-3 rounded-md border border-success/20">{selectedItem.operator_strength}</p>
                      </div>
                    )}
                    
                    {selectedItem.operator_weakness && (
                      <div>
                        <h4 className="font-medium mb-2 text-destructive">Области для развития</h4>
                        <p className="text-sm bg-destructive/5 p-3 rounded-md border border-destructive/20">{selectedItem.operator_weakness}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Заключение */}
                {selectedItem.final_conclusion && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Общий вывод</h3>
                    <p className="text-sm bg-primary/5 p-4 rounded-md border border-primary/20">{selectedItem.final_conclusion}</p>
                  </div>
                )}

                {/* Транскрипция */}
                {selectedItem.transcript && (
                  <div className="space-y-4">
                    <Collapsible open={transcriptExpanded} onOpenChange={setTranscriptExpanded}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span>Показать стенограмму</span>
                          {transcriptExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap font-mono">{selectedItem.transcript}</pre>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
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