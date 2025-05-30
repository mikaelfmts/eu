// Firebase System for Curriculum
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection,
    onSnapshot,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class CurriculumFirebase {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.user = null;
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    async init() {
        try {
            // Configuração do Firebase
            const firebaseConfig = {
                apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
                authDomain: "mikaelfmts.firebaseapp.com",
                projectId: "mikaelfmts",
                storageBucket: "mikaelfmts.firebasestorage.app",
                messagingSenderId: "516762612351",
                appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
            };

            // Inicializar Firebase
            this.app = initializeApp(firebaseConfig);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);

            console.log('✅ Firebase inicializado com sucesso');

            // Configurar autenticação
            await this.setupAuth();

            this.isConnected = true;
            this.retryCount = 0;

        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            this.handleConnectionError(error);
        }
    }

    async setupAuth() {
        return new Promise((resolve) => {
            onAuthStateChanged(this.auth, async (user) => {
                if (user) {
                    this.user = user;
                    console.log('✅ Usuário autenticado:', user.uid);
                    resolve(user);
                } else {
                    // Fazer login anônimo se não houver usuário
                    try {
                        const userCredential = await signInAnonymously(this.auth);
                        this.user = userCredential.user;
                        console.log('✅ Login anônimo realizado:', this.user.uid);
                        resolve(this.user);
                    } catch (error) {
                        console.error('❌ Erro no login anônimo:', error);
                        resolve(null);
                    }
                }
            });
        });
    }

    handleConnectionError(error) {
        console.warn(`⚠️ Tentativa ${this.retryCount + 1}/${this.maxRetries} - Erro de conexão:`, error);
        
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = Math.pow(2, this.retryCount) * 1000; // Backoff exponencial
            
            console.log(`🔄 Tentando reconectar em ${delay/1000}s...`);
            
            setTimeout(() => {
                this.init();
            }, delay);
        } else {
            console.error('❌ Máximo de tentativas de reconexão atingido');
            this.isConnected = false;
        }
    }

    async saveCurriculum(curriculumData) {
        if (!this.isConnected || !this.db) {
            console.warn('⚠️ Firebase não conectado, salvando localmente...');
            this.saveToLocalStorage(curriculumData);
            return { success: false, offline: true };
        }

        try {
            const docRef = doc(this.db, 'curriculum', 'current');
            
            const dataToSave = {
                ...curriculumData,
                lastUpdated: serverTimestamp(),
                userId: this.user ? this.user.uid : 'anonymous',
                version: this.generateVersion()
            };

            await setDoc(docRef, dataToSave);
            
            console.log('✅ Currículo salvo no Firebase com sucesso');
            
            // Também salvar localmente como backup
            this.saveToLocalStorage(curriculumData);
            
            return { success: true, offline: false };

        } catch (error) {
            console.error('❌ Erro ao salvar currículo no Firebase:', error);
            
            // Fallback para localStorage
            this.saveToLocalStorage(curriculumData);
            
            return { success: false, error: error.message, offline: true };
        }
    }

    async loadCurriculum() {
        if (!this.isConnected || !this.db) {
            console.warn('⚠️ Firebase não conectado, carregando do localStorage...');
            return this.loadFromLocalStorage();
        }

        try {
            const docRef = doc(this.db, 'curriculum', 'current');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('✅ Currículo carregado do Firebase');
                
                // Salvar no localStorage como cache
                this.saveToLocalStorage(data);
                
                return { 
                    success: true, 
                    data: data, 
                    source: 'firebase',
                    lastUpdated: data.lastUpdated 
                };
            } else {
                console.log('📄 Nenhum currículo encontrado no Firebase, tentando localStorage...');
                return this.loadFromLocalStorage();
            }

        } catch (error) {
            console.error('❌ Erro ao carregar currículo do Firebase:', error);
            
            // Fallback para localStorage
            return this.loadFromLocalStorage();
        }
    }

    saveToLocalStorage(data) {
        try {
            const storageData = {
                ...data,
                savedAt: new Date().toISOString(),
                source: 'localStorage'
            };
            
            localStorage.setItem('curriculum_data', JSON.stringify(storageData));
            console.log('💾 Currículo salvo no localStorage');
            
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('curriculum_data');
            
            if (stored) {
                const data = JSON.parse(stored);
                console.log('💾 Currículo carregado do localStorage');
                
                return { 
                    success: true, 
                    data: data, 
                    source: 'localStorage',
                    savedAt: data.savedAt 
                };
            } else {
                console.log('📭 Nenhum currículo encontrado no localStorage');
                return { success: false, message: 'Nenhum currículo salvo encontrado' };
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar do localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    // Gerar versão única para o currículo
    generateVersion() {
        return `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Verificar status da conexão
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            hasUser: !!this.user,
            userId: this.user ? this.user.uid : null,
            retryCount: this.retryCount
        };
    }

    // Escutar mudanças em tempo real (opcional)
    onCurriculumChange(callback) {
        if (!this.isConnected || !this.db) {
            console.warn('⚠️ Firebase não conectado - não é possível escutar mudanças');
            return null;
        }

        try {
            const docRef = doc(this.db, 'curriculum', 'current');
            
            return onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    console.log('🔄 Currículo atualizado em tempo real');
                    callback(doc.data());
                }
            }, (error) => {
                console.error('❌ Erro ao escutar mudanças:', error);
            });
            
        } catch (error) {
            console.error('❌ Erro ao configurar listener:', error);
            return null;
        }
    }
}

// Criar instância global
window.curriculumFirebase = new CurriculumFirebase();

export default CurriculumFirebase;
