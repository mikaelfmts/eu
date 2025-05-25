# Portfolio Mikael Ferreira

## 📌 Visão Geral

Este projeto é um site portfolio pessoal inspirado visualmente no estilo League of Legends, que apresenta habilidades, projetos e informações profissionais minhas. O site incorpora um sistema de chat em tempo real para comunicação direta com visitantes, gerenciado através de um painel administrativo. Totalmente vinculado com a API do GITHUB.

## 🌟 Características Principais

- **Design Temático**: Inspirado na estética de League of Legends
- **Sistema de Chat**: Para me comunicar em tempo real com visitantes
- **Painel Administrativo**: Gestão de mensagens, certificados e manutenção do site
- **PWA (Progressive Web App)**: Instalável em dispositivos móveis 
- **Sistema de Partículas**: Efeito visual dinâmico em todo o site
- **Tema Alternativo**: Opção para alternar entre esquemas de cores

## 📂 Estrutura do Projeto

```
(raiz)
├── index.html              # Página principal do portfolio
├── admin.html              # Painel administrativo
├── login.html              # Página de autenticação
├── manifest.json           # Configuração PWA
├── README.md               # Esta documentação
├── CHAT_README.md          # Documentação do sistema de chat
├── FIREBASE_RULES.md       # Documentação das regras de segurança
├── firebase-rules-seguras.txt # Definições de segurança do Firestore
└── assets/
    ├── css/
    │   └── styles.css      # Estilos principais
    ├── images/             # Imagens do site
    └── js/
        ├── admin.js        # Funcionalidades do painel admin
        ├── auth.js         # Sistema de autenticação
        ├── firebase-config.js # Configuração do Firebase
        ├── game-fehuna.js  # Mini-jogo interativo
        ├── script.js       # Scripts principais
        └── sw.js           # Service Worker para PWA
└── pages/
    ├── certificates-in-progress.html # Página de certificados em andamento
    ├── curriculum.html     # Currículo
    ├── games.html          # Jogos desenvolvidos
    ├── interactive-projects.html # Projetos interativos
    ├── mentors.html        # Mentores e influências
    └── projetos.html       # Portfolio de projetos
```

## 🔧 Tecnologias Utilizadas

### Frontend
- **HTML5**: Estruturação do conteúdo
- **CSS3**: Estilização e animações 
- **JavaScript (ES6+)**: Interatividade e dinamismo
- **Tailwind CSS**: Framework CSS para o painel administrativo

### Backend (Serverless)
- **Firebase Firestore**: Banco de dados para o sistema de chat
- **Firebase Auth**: Autenticação para área administrativa
- **Firebase Storage**: Armazenamento de arquivos e imagens

### Outras Ferramentas
- **Font Awesome**: Ícones utilizados no site
- **Google Fonts**: Tipografia personalizada
- **PWA**: Recursos de aplicativo web progressivo

## 🚀 Funcionalidades

### Página Principal (index.html)
- **Perfil**: Informações pessoais e profissionais
- **Habilidades Técnicas**: Visualização das competências técnicas
- **Projetos**: Portfólio de trabalhos realizados
- **GitHub**: Integração com perfil e repositórios do GitHub
- **Redes Sociais**: Links para presença online
- **Chat**: Sistema de comunicação com o administrador do site
- **Modo Alternativo de Tema**: Troca entre esquemas de cores

### Painel Administrativo (admin.html)
- **Sistema de Chat**: Gestão e resposta de mensagens
- **Uploads**: Sistema para gerenciar arquivos do site
- **Usuários**: Controle de acesso
- **Certificados**: Sistema para exibir certificações profissionais
- **Manutenção**: Configurações para modo de manutenção do site

### Autenticação (login.html)
- **Login Seguro**: Sistema de autenticação para acesso ao painel administrativo

## 📡 Sistema de Chat

O sistema de chat permite comunicação em tempo real entre visitantes e o administrador do site:

### Para Visitantes
- Solicitação obrigatória de nome antes de iniciar o chat
- Envio de mensagens em tempo real
- Visualização de respostas do administrador
- Interface moderna e responsiva

### Para Administradores
- Painel de gestão com navegação por abas
- Lista de chats agrupados por pessoa
- Contador de mensagens não respondidas
- Interface para responder mensagens
- Atualização em tempo real

Para mais informações sobre o sistema de chat, consulte o [CHAT_README.md](CHAT_README.md).

## 🔒 Segurança

O site utiliza regras de segurança do Firebase Firestore para proteger os dados e garantir a integridade das informações.

Diferentes regras de segurança foram configuradas para:
- **Mensagens**: Controle de leitura/escrita para o sistema de chat
- **Configurações**: Ajustes para o modo de manutenção
- **Certificados**: Gerenciamento de certificações profissionais

Para mais detalhes sobre as regras de segurança, consulte o [FIREBASE_RULES.md](FIREBASE_RULES.md).

## 🔄 Progressive Web App (PWA)

O site funciona como um PWA, permitindo:
- Instalação em dispositivos móveis
- Funcionalidade offline para conteúdo básico
- Experiência de uso semelhante a aplicativos nativos
- Cache de recursos para carregamento rápido

## 🌐 Páginas Adicionais

O site conta com várias páginas secundárias para organizar melhor o conteúdo:
- **Currículo**: Histórico profissional e formação acadêmica
- **Projetos**: Portfolio detalhado de trabalhos
- **Jogos**: Projetos de jogos desenvolvidos
- **Projetos Interativos**: Demonstrações interativas de habilidades
- **Certificados**: Exibição de certificações profissionais
- **Mentores**: Pessoas que influenciaram a trajetória profissional

## 🎨 Efeitos Visuais

### Sistema de Partículas
O site conta com um sistema de partículas animadas que dão vida ao design, criando um efeito visual dinâmico inspirado no estilo de League of Legends.

### Tema Alternativo
É possível alternar entre dois esquemas de cores diferentes, adaptando a experiência visual às preferências do usuário.

## 📱 Responsividade

O design é totalmente responsivo, adaptando-se a diferentes tamanhos de tela:
- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Layout adaptado para telas médias
- **Mobile**: Interface otimizada para smartphones

## 🛠️ Instruções para Desenvolvimento

1. Clone o repositório
2. Configure o Firebase com suas próprias credenciais
3. Modifique os arquivos conforme necessário
4. Teste localmente antes de fazer deploy

## 📄 Licença

Este projeto é de uso pessoal de Mikael Ferreira como portfolio profissional.

## 📞 Contato

Para entrar em contato, utilize o sistema de chat no próprio site ou as redes sociais listadas na página principal.

---

🎮 Desenvolvido com inspiração na estética de League of Legends | © 2025 Mikael Ferreira
