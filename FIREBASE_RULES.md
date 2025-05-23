# Regras de Segurança do Firebase Firestore

Para configurar as regras de segurança do seu projeto Firebase, siga estes passos:

## 1. Acesse o Console Firebase
- Vá para https://console.firebase.google.com
- Selecione seu projeto "mikaelfmts"
- Clique em "Firestore Database"
- Vá para a aba "Regras"

## 2. Regras Recomendadas (Desenvolvimento)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção de mensagens
    match /mensagens/{messageId} {
      // Permite que qualquer usuário leia e escreva mensagens
      // ATENÇÃO: Esta regra é permissiva para desenvolvimento
      allow read, write: if true;
    }
    
    // Bloquear acesso a outras coleções por padrão
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 3. Regras Mais Seguras (Produção)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção de mensagens
    match /mensagens/{messageId} {
      // Permite leitura para todos
      allow read: if true;
      
      // Permite criação de novas mensagens com validação
      allow create: if isValidMessage();
      
      // Permite atualizações apenas nos campos de resposta
      // (para quando você responder via admin panel)
      allow update: if isValidUpdate();
      
      // Não permite deletar mensagens
      allow delete: if false;
    }
    
    // Funções auxiliares
    function isValidMessage() {
      let data = resource.data;
      return data.keys().hasAll(['nome', 'mensagem', 'hora', 'chat_id', 'respondido'])
        && data.nome is string
        && data.nome.size() > 0
        && data.nome.size() <= 50
        && data.mensagem is string
        && data.mensagem.size() > 0
        && data.mensagem.size() <= 1000
        && data.chat_id is string
        && data.respondido == false
        && data.resposta == '';
    }
    
    function isValidUpdate() {
      let beforeData = resource.data;
      let afterData = request.resource.data;
      
      // Permite apenas atualizar resposta e status respondido
      return beforeData.diff(afterData).affectedKeys().hasOnly(['resposta', 'respondido', 'horaResposta'])
        && afterData.resposta is string
        && afterData.respondido == true;
    }
    
    // Bloquear acesso a outras coleções
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 4. Como Aplicar as Regras

1. Copie uma das versões acima
2. Cole no editor de regras do Firebase Console
3. Clique em "Publicar"
4. Teste o sistema para garantir que funciona

## 5. Explicação das Regras

### Versão de Desenvolvimento
- **Simples e permissiva**: Qualquer usuário pode ler/escrever
- **Ideal para**: Testes e desenvolvimento
- **Segurança**: Baixa, mas suficiente para testes

### Versão de Produção
- **Validação de dados**: Verifica estrutura e tamanhos
- **Controle de atualizações**: Apenas campos específicos podem ser atualizados
- **Prevenção de spam**: Limita tamanho de mensagens
- **Proteção de dados**: Não permite exclusão de mensagens

## 6. Monitoramento

No console Firebase, você pode:
- Ver todas as mensagens em "Firestore Database > Dados"
- Monitorar uso em "Firestore Database > Uso"
- Verificar logs de segurança em "Firestore Database > Regras"

## 7. Backup dos Dados

Recomenda-se fazer backup regular dos dados:
- Export manual via Console Firebase
- Ou configurar backups automáticos (projeto pago)

---

**Nota**: Comece com as regras de desenvolvimento e migre para as de produção quando estiver satisfeito com o funcionamento.
