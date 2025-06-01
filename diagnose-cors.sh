#!/bin/bash

# Script de Diagnóstico CORS - Firebase Storage
# Este script verifica as configurações e gera um relatório

echo "🔍 DIAGNÓSTICO CORS - FIREBASE STORAGE"
echo "======================================"
echo ""

# Verificar se está rodando no domínio correto
echo "1. VERIFICANDO DOMÍNIO ATUAL:"
if [[ "$HOSTNAME" == *"github.io"* ]] || [[ "$PWD" == *"github.io"* ]]; then
    echo "✅ Rodando em domínio GitHub Pages"
else
    echo "⚠️  Rodando localmente - CORS pode não ser reproduzido"
fi
echo ""

# Verificar configuração Firebase
echo "2. VERIFICANDO CONFIGURAÇÃO FIREBASE:"
if grep -r "mikaelfmts.appspot.com" assets/js/ > /dev/null 2>&1; then
    echo "✅ Storage Bucket correto: mikaelfmts.appspot.com"
else
    echo "❌ Storage Bucket incorreto - deve ser mikaelfmts.appspot.com"
fi

if grep -r "projectId.*mikaelfmts" assets/js/ > /dev/null 2>&1; then
    echo "✅ Project ID correto: mikaelfmts"
else
    echo "❌ Project ID incorreto"
fi
echo ""

# Verificar regras Firebase
echo "3. VERIFICANDO REGRAS FIREBASE:"
if [ -f "firebase-rules.txt" ]; then
    echo "✅ Arquivo de regras encontrado"
    if grep -q "allow read: if true" firebase-rules.txt; then
        echo "✅ Regra de leitura pública configurada"
    else
        echo "❌ Regra de leitura pública não encontrada"
    fi
    
    if grep -q "allow write: if request.auth != null" firebase-rules.txt; then
        echo "✅ Regra de escrita para usuários autenticados configurada"
    else
        echo "❌ Regra de escrita não encontrada"
    fi
else
    echo "❌ Arquivo firebase-rules.txt não encontrado"
fi
echo ""

# Verificar autenticação
echo "4. VERIFICANDO AUTENTICAÇÃO:"
if grep -r "signInAnonymously" assets/js/ > /dev/null 2>&1; then
    echo "✅ Login anônimo implementado"
else
    echo "❌ Login anônimo não encontrado"
fi

if grep -r "onAuthStateChanged" assets/js/ > /dev/null 2>&1; then
    echo "✅ Listener de autenticação implementado"
else
    echo "❌ Listener de autenticação não encontrado"
fi
echo ""

# Verificar função de upload
echo "5. VERIFICANDO FUNÇÃO DE UPLOAD:"
if grep -r "uploadBytesResumable" assets/js/ > /dev/null 2>&1; then
    echo "✅ uploadBytesResumable implementado (melhor para CORS)"
else
    echo "❌ uploadBytesResumable não encontrado"
fi

if grep -r "performUpload" assets/js/ > /dev/null 2>&1; then
    echo "✅ Função de upload com retry implementada"
else
    echo "❌ Função de upload com retry não encontrada"
fi
echo ""

# Verificar HTTPS
echo "6. VERIFICANDO PROTOCOLO:"
if grep -r "https://" assets/js/ > /dev/null 2>&1; then
    echo "✅ URLs HTTPS encontradas"
else
    echo "⚠️  Verifique se todas as URLs são HTTPS"
fi
echo ""

# Gerar relatório de status
echo "7. RELATÓRIO FINAL:"
echo "=================="

# Contar problemas
issues=0

if ! grep -r "mikaelfmts.appspot.com" assets/js/ > /dev/null 2>&1; then
    ((issues++))
fi

if [ ! -f "firebase-rules.txt" ]; then
    ((issues++))
fi

if ! grep -r "signInAnonymously" assets/js/ > /dev/null 2>&1; then
    ((issues++))
fi

if ! grep -r "uploadBytesResumable" assets/js/ > /dev/null 2>&1; then
    ((issues++))
fi

if [ $issues -eq 0 ]; then
    echo "🎉 TUDO CONFIGURADO CORRETAMENTE!"
    echo ""
    echo "Próximos passos:"
    echo "1. Abra o Firebase Console: https://console.firebase.google.com"
    echo "2. Vá para Storage > Rules"
    echo "3. Cole o conteúdo do arquivo firebase-rules.txt"
    echo "4. Clique em 'Publicar'"
    echo "5. Aguarde alguns minutos para propagação"
    echo "6. Teste o upload novamente"
else
    echo "⚠️  $issues PROBLEMA(S) ENCONTRADO(S)"
    echo ""
    echo "Execute as correções necessárias antes de continuar."
fi

echo ""
echo "Para teste direto, abra: debug-cors.html"
echo "Para verificar logs em tempo real: Console do navegador (F12)"
echo ""
