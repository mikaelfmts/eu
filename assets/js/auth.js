// Importando funções do Firebase Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Configuração do Firebase - definida diretamente para evitar problemas de importação
const firebaseConfig = {
  apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
  authDomain: "mikaelfmts.firebaseapp.com",
  projectId: "mikaelfmts",
  storageBucket: "mikaelfmts.appspot.com",
  messagingSenderId: "516762612351",
  appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

// Lista de emails de administradores (hardcoded por segurança)
const ADMIN_EMAILS = [
    'mikaelmts@gmail.com',
    'mikael.fmts@gmail.com',
    'mikaelmatos.adm@gmail.com'
    // Adicione outros emails de admin conforme necessário
];

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para verificar autenticação E permissão de admin
export function checkAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Verificar se o usuário é admin
                if (ADMIN_EMAILS.includes(user.email)) {
                    console.log("Administrador autenticado:", user.email);
                    resolve(user);
                } else {
                    // Usuário logado mas não é admin - fazer logout e bloquear
                    console.log("Usuário não autorizado tentando acessar admin:", user.email);
                    signOut(auth).then(() => {
                        alert('Acesso negado! Você não tem permissão para acessar esta área.');
                        window.location.href = 'index.html';
                    });
                    reject('Usuário não autorizado');
                }
            } else {
                // Não está logado, redireciona para login
                console.log("Usuário não autenticado, redirecionando...");
                window.location.href = 'login.html';
                reject('Usuário não autenticado');
            }
        });
    });
}

// Função para fazer login
export function doLogin(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

// Função para fazer logout
export function doLogout() {
    return signOut(auth).then(() => {
        console.log("Logout realizado com sucesso");
        window.location.href = 'login.html';
    });
}

// Função para verificar se um usuário é admin
export function isAdmin(email) {
    return ADMIN_EMAILS.includes(email);
}

// Função para verificar admin de forma síncrona (se já tiver usuário logado)
export function checkAdminSync() {
    const user = auth.currentUser;
    return user && ADMIN_EMAILS.includes(user.email);
}

// Se este script estiver sendo executado na página de login, configura o formulário
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('login-form');
        const errorElement = document.getElementById('error-message');
        
        // Verifica se já está logado
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Se já estiver logado, redireciona para admin.html
                window.location.href = 'admin.html';
            }
        });
        
        // Configuração do formulário de login
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                // Esconde mensagem de erro anterior
                errorElement.classList.add('hidden');
                
                // Tenta fazer login
                signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        // Login bem-sucedido, redireciona para o painel
                        window.location.href = 'admin.html';
                    })
                    .catch((error) => {
                        // Exibe mensagem de erro
                        let mensagemErro;
                        
                        switch(error.code) {
                            case 'auth/invalid-email':
                                mensagemErro = 'Email inválido.';
                                break;
                            case 'auth/user-disabled':
                                mensagemErro = 'Esta conta foi desativada.';
                                break;
                            case 'auth/user-not-found':
                                mensagemErro = 'Usuário não encontrado.';
                                break;
                            case 'auth/wrong-password':
                                mensagemErro = 'Senha incorreta.';
                                break;
                            case 'auth/too-many-requests':
                                mensagemErro = 'Muitas tentativas. Tente novamente mais tarde.';
                                break;
                            default:
                                mensagemErro = `Erro no login: ${error.message}`;
                        }
                        
                        errorElement.textContent = mensagemErro;
                        errorElement.classList.remove('hidden');
                    });
            });
        }
    });
}
