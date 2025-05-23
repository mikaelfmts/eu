// Importando funções do Firebase Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// Configuração do Firebase - definida diretamente para evitar problemas de importação
const firebaseConfig = {
  apiKey: "AIzaSyDOxxBvg9eeRJLAgB3vW51PvM9hD9mmkW4",
  authDomain: "mikaelfmts.firebaseapp.com",
  projectId: "mikaelfmts",
  storageBucket: "mikaelfmts.appspot.com",
  messagingSenderId: "947411827517",
  appId: "1:947411827517:web:e77181d5723f7da45464cb",
  measurementId: "G-VMCRQX81ZR"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para verificar autenticação
export function checkAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Usuário está logado
                console.log("Usuário autenticado:", user.email);
                resolve(user);            } else {
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
