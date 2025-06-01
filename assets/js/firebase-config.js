// Configuração do Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyA0VoWMLTJIyI54Pj0P5T75gCH6KpgAcbk",
  authDomain: "mikaelfmts.firebaseapp.com",
  projectId: "mikaelfmts",
  storageBucket: "mikaelfmts.appspot.com",
  messagingSenderId: "516762612351",
  appId: "1:516762612351:web:f8a0f229ffd5def8ec054a"
};

// Estrutura de dados para certificados
export const certificadosStructure = {
  titulo: "string",
  instituicao: "string", 
  dataConclusao: "string",
  status: "string", // "concluido" ou "em progresso"
  certificadoUrl: "string"
};

// Exporta a configuração para ser usada em outros arquivos
export default firebaseConfig;
