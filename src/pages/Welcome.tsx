import { Button } from '@/components/ui/button';
import { FileText, Sparkles, BookOpen, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'Formatação ABNT Automática',
      description: 'Margens, fontes e espaçamento segundo as normas brasileiras',
    },
    {
      icon: Sparkles,
      title: 'Editor Intuitivo',
      description: 'Adicione elementos por blocos e visualize em tempo real',
    },
    {
      icon: BookOpen,
      title: 'Elementos Completos',
      description: 'Capa, sumário, citações, tabelas, notas de rodapé e mais',
    },
    {
      icon: Printer,
      title: 'Exportação Profissional',
      description: 'Exporte para PDF ou DOCX mantendo a formatação',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      <header className="p-6 flex justify-end">
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block p-4 bg-gradient-primary rounded-2xl mb-6 shadow-lg">
              <FileText className="w-16 h-16 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              ABNT Doc Editor
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Crie documentos acadêmicos profissionais com formatação ABNT automática
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/editor')}
                className="gap-2 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Começar Novo Documento
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-all hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="p-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>Editor de Documentos ABNT - Formatação automática segundo normas brasileiras</p>
      </footer>
    </div>
  );
};

export default Welcome;
