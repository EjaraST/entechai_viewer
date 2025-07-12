import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
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
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchTranscriptions();
  }, []);
  const fetchTranscriptions = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('transcriptions').select('*').order('created_at', {
        ascending: false
      });
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
  const filteredData = transcriptions.filter(item => item.summary_full.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">EntechAI
Транскрипции звонков (Telegram
        </h1>
          <p className="text-muted-foreground">Просмотр и анализ записей телефонных разговоров</p>
        </div>

        {/* Поиск */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Поиск по содержанию транскрипции..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {/* Состояние загрузки */}
        {loading ? <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Загрузка транскрипций...</span>
          </div> : <>
            {/* Карточки */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map(item => <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedItem(item)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  {item.goal_achieved ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {formatDate(item.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.summary_short}</p>
                </CardContent>
              </Card>)}
            </div>

            {filteredData.length === 0 && !loading && <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {transcriptions.length === 0 ? "Нет транскрипций для отображения" : "По вашему запросу ничего не найдено"}
                </p>
              </div>}
          </>}

        {/* Модальное окно */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedItem && <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedItem.title}
                    {selectedItem.goal_achieved ? <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Цель достигнута
                      </Badge> : <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Цель не достигнута
                      </Badge>}
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
              </>}
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default Index;