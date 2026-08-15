// Service Worker do RDO Master Energy — versão mínima, de propósito.
//
// Por que mínimo? Este sistema é atualizado com frequência (correções, ajustes de
// layout, novas regras de validação). Um Service Worker "agressivo" (que guarda o
// HTML/JS em cache e serve essa cópia salva) é a causa nº 1 de PWAs que "não
// atualizam sozinhos" — o encarregado abre o app no celular e continua vendo uma
// versão de semanas atrás, sem entender por quê, porque o Service Worker está
// entregando a cópia antiga em vez de buscar a nova.
//
// Este aqui só faz o necessário pra passar nos critérios de instalável (ter um SW
// registrado) e ativa a versão nova assim que ela chega, sem prender ninguém numa
// versão velha. Ele NÃO guarda nada em cache pra funcionar 100% offline — o app já
// tem seu próprio mecanismo de funcionar offline via localStorage (salva no aparelho
// e sincroniza sozinho quando a internet voltar), então isso não é papel do Service
// Worker aqui.

const VERSAO_SW = 'rdo-master-energy-v1';

self.addEventListener('install', (event) => {
  // Não espera o SW antigo "morrer" sozinho — assume o controle assim que instalado.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Assume o controle de todas as abas abertas imediatamente (não precisa fechar e
  // reabrir o app pra pegar a versão nova do Service Worker).
  event.waitUntil(self.clients.claim());
});

// Sem "cache-first" nem "offline fallback" de propósito — todo pedido vai direto pra
// rede, sempre buscando a versão mais atual. Isso significa que o app SEM Service
// Worker e COM este Service Worker se comportam igual quando online; a diferença só
// aparece nos critérios de instalação (ícone na tela inicial).
self.addEventListener('fetch', (event) => {
  // Passa direto pra rede — este SW não intercepta nem modifica nenhum pedido.
});
