import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle } from "lucide-react";

// Mock данные для демонстрации
const mockData = [
  {
    id: 1,
    title: "Звонок клиента по техподдержке",
    summary_short: "Клиент звонил с проблемой подключения интернета",
    summary_full: "Клиент обратился с жалобой на нестабильное подключение к интернету. Проблема была диагностирована и решена путем перезагрузки маршрутизатора.",
    created_at: "2024-01-15T14:30:00Z",
    goal_achieved: true,
    steno: "14:30 - Клиент: Здравствуйте, у меня проблемы с интернетом...\n14:31 - Оператор: Добро пожаловать! Я помогу вам решить проблему..."
  },
  {
    id: 2,
    title: "Консультация по тарифам",
    summary_short: "Клиент интересовался новыми тарифными планами",
    summary_full: "Потенциальный клиент звонил для получения информации о доступных тарифных планах. Была предоставлена подробная консультация по всем возможным опциям.",
    created_at: "2024-01-15T16:45:00Z",
    goal_achieved: false,
    steno: "16:45 - Клиент: Расскажите пожалуйста о ваших тарифах...\n16:46 - Оператор: Конечно! У нас есть несколько вариантов..."
  },
  {
    id: 3,
    title: "Жалоба на качество связи",
    summary_short: "Клиент пожаловался на плохое качество мобильной связи",
    summary_full: "Клиент выразил недовольство качеством мобильной связи в определенном районе города. Заявка передана в технический отдел для проверки базовых станций.",
    created_at: "2024-01-16T09:15:00Z",
    goal_achieved: true,
    steno: "09:15 - Клиент: У меня очень плохая связь дома...\n09:16 - Оператор: Понимаю вашу проблему, давайте разберемся..."
  }
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const filteredData = mockData.filter(item =>
    item.summary_full.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Транскрипции звонков</h1>
          <p className="text-muted-foreground">Просмотр и анализ записей телефонных разговоров</p>
        </div>

        {/* Поиск */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по содержанию транскрипции..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  {item.goal_achieved ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {formatDate(item.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.summary_short}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">По вашему запросу ничего не найдено</p>
          </div>
        )}

        {/* Модальное окно */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedItem.title}
                    {selectedItem.goal_achieved ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Цель достигнута
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
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
    </div>
  );
};

export default Index;
