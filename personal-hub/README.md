# Personal Hub - Setup e Configuração

## 🎯 Visão Geral
O Personal Hub é um sistema de organização da vida digital integrado ao portfolio. Esta implementação é uma versão MVP que utiliza tecnologias gratuitas.

## 🔧 Configuração Inicial

### 1. Firebase Setup
1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou use o existente
3. Ative **Firestore Database** e **Authentication**
4. Configure as regras de segurança usando o arquivo `firebase-security-rules.js`

### 2. APIs Configuradas
✅ **TMDB API**: `066a2b59382e7b03a5b3abc8944e0f9e`
✅ **Google Books API**: `AIzaSyDWfAhM7puO7VeSSyXO190bbG1-tDzvl9Y`  
✅ **Cloudinary**: `622323917966629`

### 3. Estrutura de Dados Firestore

```
users/
  {userId}/
    name: string
    email: string
    createdAt: timestamp
    stats: {
      totalEntries: number
      moviesWatched: number
      booksRead: number
      songsPlayed: number
    }

diary/
  {entryId}/
    userId: string
    title: string
    content: string
    createdAt: timestamp
    mood: string

movies/
  {movieId}/
    userId: string
    title: string
    poster: string
    overview: string
    rating: number
    tmdbId: number
    createdAt: timestamp
    status: string

books/
  {bookId}/
    userId: string
    title: string
    authors: array
    description: string
    thumbnail: string
    googleBooksId: string
    createdAt: timestamp
    status: string

music/
  {songId}/
    userId: string
    title: string
    artist: string
    album: string
    duration: number
    fileUrl: string
    createdAt: timestamp
```

## 🚀 Recursos Implementados

### ✅ Funcionalidades Prontas
- [x] Sistema de autenticação (login/registro)
- [x] Dashboard principal com estatísticas
- [x] Widget no portfolio com métricas em tempo real
- [x] Integração com TMDB para filmes
- [x] Integração com Google Books para livros
- [x] Sistema básico de diário digital
- [x] Página de estatísticas detalhadas
- [x] Exportação de dados (JSON/CSV)
- [x] Design responsivo e PWA-ready

### 🔧 Em Desenvolvimento
- [ ] Player de música com upload de arquivos
- [ ] Sistema de tags e categorias
- [ ] Gráficos avançados de progresso
- [ ] Notificações web push
- [ ] Modo offline completo
- [ ] Backup automático

## 🔗 Navegação

### URLs do Sistema
- **Login/Registro**: `/personal-hub/index.html`
- **Dashboard**: `/personal-hub/dashboard.html`
- **Estatísticas**: `/pages/personal-hub-stats.html`

### Widget no Portfolio
O widget é automaticamente carregado na página principal (`index.html`) e exibe:
- Status de conexão
- Estatísticas em tempo real
- Última atividade
- Links de acesso rápido

## 🔒 Segurança

### Regras do Firestore
- Usuários só podem acessar seus próprios dados
- Validação de autenticação obrigatória
- Prevenção contra acesso cruzado de dados

### APIs Públicas
- Todas as chaves de API estão configuradas para o domínio `mikaelfmts.github.io`
- Limitações de uso dentro dos planos gratuitos
- Fallbacks implementados para indisponibilidade

## 📱 Progressive Web App

O Personal Hub é compatível com PWA, oferecendo:
- Instalação como aplicativo
- Funcionamento offline básico
- Notificações web
- Ícones personalizados

## 🎨 Personalização

### Cores e Tema
O sistema utiliza as variáveis CSS do portfolio:
- `--primary-color`: #c8aa6e (dourado)
- `--bg-color`: #0a1428 (azul escuro)
- `--text-color`: #f0e6d2 (bege claro)

### Customização
Edite os arquivos em `personal-hub/styles/` para personalizar a aparência.

## 📊 Analytics

### Métricas Coletadas
- Número de entradas do diário
- Filmes e livros adicionados
- Frequência de uso
- Padrões de atividade

### Relatórios
- Gráficos mensais de atividade
- Distribuição por categoria
- Histórico completo
- Exportação de dados

## 🐛 Troubleshooting

### Problemas Comuns
1. **Widget não carrega**: Verificar se Firebase está configurado
2. **APIs não funcionam**: Confirmar chaves e domínio autorizado
3. **Dados não salvam**: Verificar regras do Firestore
4. **Autenticação falha**: Verificar configuração do Firebase Auth

### Logs de Debug
Abra o Console do navegador (F12) para ver logs detalhados do sistema.

## 📈 Roadmap

### Versão 1.1 (Próxima)
- Player de música funcional
- Sistema de backup
- Melhorias na UI/UX

### Versão 1.2 (Futura)
- Integração com mais APIs
- Sistema social básico
- Relatórios avançados

---

**Desenvolvido por Mikael Ferreira** | **2025**
