# 🏠 Personal Hub - Sistema de Organização Pessoal

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação
- Login/Registro com Firebase Auth
- Perfis de usuário seguros
- Isolamento de dados por usuário

### 📊 Dashboard
- Estatísticas em tempo real
- Atividades recentes
- Ações rápidas para todas as funcionalidades

### 📖 Diário Digital
- Entradas pessoais com data/hora
- Sistema de humor/mood tracking
- Busca e organização por período

### 🎬 Gestão de Filmes
- Integração com TMDB API
- Busca automática de dados (poster, sinopse, etc.)
- Status: Assistido, Quero Assistir, Assistindo
- Sistema de avaliação pessoal

### 📚 Gestão de Livros
- Integração com Google Books API
- Informações completas (autor, capa, descrição)
- Tracking de progresso de leitura
- Resenhas e notas pessoais

### 🎵 Player de Música
- Upload de arquivos via Cloudinary
- Organização por artista/álbum
- Contador de reproduções
- Biblioteca pessoal

### 📈 Estatísticas Avançadas
- Gráficos interativos (Chart.js)
- Análise temporal de atividades
- Exportação de dados (JSON/CSV)
- Relatórios detalhados

### 🏠 Widget no Portfolio
- Integração com página principal
- Métricas em tempo real
- Acesso rápido ao sistema

## 🛠️ APIs Configuradas

| Serviço | Chave/Config | Status |
|---------|--------------|--------|
| TMDB | `066a2b59382e7b03a5b3abc8944e0f9e` | ✅ Ativo |
| Google Books | `AIzaSyDWfAhM7puO7VeSSyXO190bbG1-tDzvl9Y` | ✅ Ativo |
| Cloudinary | `duulvcbfa` / `622323917966629` | ✅ Ativo |
| Firebase | Projeto `mikaelfmts` | ✅ Ativo |

## 🚀 Como Usar

1. **Acesso**: Clique no widget "Personal Hub" na página principal
2. **Login**: Registre-se ou faça login com email/senha
3. **Dashboard**: Navegue pelas funcionalidades disponíveis
4. **Adicionar Conteúdo**: Use os botões de ação rápida ou navegue pelas seções

## 📁 Estrutura de Arquivos

```
personal-hub/
├── index.html              # Login/Registro
├── dashboard.html          # Dashboard principal  
├── config.js              # Configuração das APIs
├── js/
│   ├── auth.js            # Sistema de autenticação
│   ├── dashboard.js       # Lógica do dashboard
│   └── stats.js          # Estatísticas avançadas
└── styles/
    └── personal-hub.css   # Estilos do sistema
```

## 🔒 Segurança

- **Dados isolados**: Cada usuário só acessa seus próprios dados
- **Regras Firestore**: Validação rigorosa de permissões
- **Autenticação obrigatória**: Todas as operações requerem login
- **APIs seguras**: Chaves configuradas para domínio específico

## 📊 Estrutura de Dados

### Firestore Collections
```
users/{userId}           # Perfis de usuário
diary/{entryId}         # Entradas do diário
movies/{movieId}        # Filmes gerenciados
books/{bookId}          # Livros da biblioteca
music/{songId}          # Músicas da coleção
activities/{activityId} # Log de atividades
```

## 🎨 Design

- **Tema integrado** com o portfolio principal
- **Cores consistentes**: Dourado (#c8aa6e) e azul escuro (#0a1428)
- **Responsivo**: Funciona em desktop e mobile
- **Animações suaves**: Feedback visual agradável

## ✅ Status Atual

- [x] Sistema base implementado
- [x] Autenticação funcional
- [x] Dashboard operacional
- [x] Widget integrado
- [x] APIs configuradas
- [x] Segurança implementada
- [ ] Testes finais em produção
- [ ] Upload preset Cloudinary
- [ ] Funcionalidades avançadas

## 🔧 Configuração Cloudinary

Para funcionalidade completa de upload de música:

1. Acesse [Cloudinary Console](https://cloudinary.com/console)
2. Vá em **Settings > Upload**
3. Crie upload preset `personal_hub`
4. Configure como **Unsigned**

## 🌐 Deploy

O sistema está pronto para produção. Certifique-se de:

1. ✅ Firebase configurado
2. ✅ Regras de segurança aplicadas
3. ✅ APIs funcionando
4. ⏳ Upload preset Cloudinary configurado

---

**Personal Hub v1.0** | Desenvolvido por Mikael Ferreira
