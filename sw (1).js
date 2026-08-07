// Service worker: a PÁGINA (index.html) sempre busca a versão mais nova primeiro quando
// há internet — evita ficar preso numa versão antiga depois de uma correção. As
// bibliotecas pesadas (PDF/Excel/Supabase) e os ícones, que quase nunca mudam, continuam
// abrindo instantâneo da cópia salva. Nos dois casos, sem internet, cai pro que já foi
// salvo antes — o app continua abrindo offline.
const CACHE_NAME='rdo-master-energy-v4';
const ARQUIVOS_ESTATICOS=[
  './manifest.json','./icon-192.png','./icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js'
];
const ARQUIVOS=['./index.html',...ARQUIVOS_ESTATICOS];

self.addEventListener('install',e=>{
  // addAll() falha por completo se UM arquivo só der erro (ex: CDN fora do ar
  // naquele instante) — cacheando um por um, um problema isolado não derruba
  // o cache inteiro, e a página/ícones (os mais essenciais) quase sempre entram.
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>
      Promise.all(ARQUIVOS.map(url=>
        cache.add(url).catch(err=>console.log('SW: não conseguiu cachear',url,err))
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(nomes=>Promise.all(nomes.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  const url=e.request.url;
  const ehIndex=url.endsWith('index.html')||e.request.mode==='navigate';
  const ehArquivoEstatico=ARQUIVOS_ESTATICOS.some(a=>url.endsWith(a.replace('./','')));

  if(ehIndex){
    // NETWORK-FIRST: tenta buscar a versão mais nova; só usa a salva se estiver offline.
    e.respondWith(
      fetch(e.request).then(resp=>{
        caches.open(CACHE_NAME).then(cache=>cache.put(e.request,resp.clone()));
        return resp;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }

  if(ehArquivoEstatico){
    // CACHE-FIRST: essas praticamente não mudam, então abrir instantâneo da cópia salva
    // (e atualizar por trás pra próxima vez) é seguro e mais rápido.
    e.respondWith(
      caches.match(e.request).then(cached=>{
        const buscaEAtualiza=fetch(e.request).then(resp=>{
          caches.open(CACHE_NAME).then(cache=>cache.put(e.request,resp.clone()));
          return resp;
        }).catch(()=>cached);
        return cached||buscaEAtualiza;
      })
    );
    return;
  }

  // Qualquer outra requisição (ex: chamadas ao Supabase) passa direto pela rede,
  // sem interferência do cache — são dados que precisam estar sempre atualizados.
});
