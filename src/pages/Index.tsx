import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Loader2, FileText, Target, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transcription {
  id: string;
  title: string;
  summary_short: string;
  summary_full: string;
  created_at: string;
  goal_achieved: boolean;
  steno: string;
  audio_id?: string;
  source?: string;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Transcription | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'success' | 'failed'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить транскрипции",
          variant: "destructive"
        });
        console.error('Error fetching transcriptions:', error);
        return;
      }

      setTranscriptions(data || []);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const metrics = useMemo(() => {
    const total = transcriptions.length;
    const successful = transcriptions.filter(t => t.goal_achieved).length;
    const failed = total - successful;
    
    return {
      total,
      successful,
      failed
    };
  }, [transcriptions]);

  const filteredData = useMemo(() => {
    let filtered = transcriptions;
    
    // Apply goal filter
    if (activeFilter === 'success') {
      filtered = filtered.filter(item => item.goal_achieved);
    } else if (activeFilter === 'failed') {
      filtered = filtered.filter(item => !item.goal_achieved);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.summary_full.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [transcriptions, activeFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      {/* Фиксированная шапка */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-light mb-2">EntechAI: Транскрипции звонков</h1>
            <p className="text-muted-foreground font-light">Просмотр и анализ записей телефонных разговоров</p>
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
              placeholder="Поиск по содержанию транскрипции..."
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
            <span className="ml-2 text-muted-foreground">Загрузка транскрипций...</span>
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
                      <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                      {item.goal_achieved ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                    </div>
                    <CardDescription className="text-sm text-muted-foreground font-light">
                      {formatDate(item.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">{item.summary_short}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredData.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-light">
                  {transcriptions.length === 0
                    ? "Нет транскрипций для отображения"
                    : "По вашему запросу ничего не найдено"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальное окно */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedItem.title}
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
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Дата создания:</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedItem.created_at)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Краткое описание:</h4>
                  <p className="text-sm">{selectedItem.summary_short}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Полное описание:</h4>
                  <p className="text-sm">{selectedItem.summary_full}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Стенограмма:</h4>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{selectedItem.steno}</pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;