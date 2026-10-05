import {filterRows} from './filters.js';
import {createReport} from './pdf.js';
const $=id=>document.getElementById(id);
const number=new Intl.NumberFormat('pt-BR');
const percent=new Intl.NumberFormat('pt-BR',{style:'percent',minimumFractionDigits:2,maximumFractionDigits:2});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields={municipio:'Município',zona:'Zona eleitoral',votos:'Quantidade de votos',participacao:'Participação estadual (%)'};
const operators={contains:'Contém',eq:'É igual a',gte:'Maior ou igual a',lte:'Menor ou igual a'};
let meta,municipios,zonas,view='municipios',rows=[],rules=[],page=1,query={},pdfBusy=false;
const pageSize=20;
function description(){
 const parts=[view==='zonas'?'Visão por município e zona':'Visão por município'];
 if(query.municipio)parts.push('Município: '+municipios.find(m=>m.codigoMunicipio===query.municipio)?.municipio);
 if(query.search)parts.push('Busca: '+query.search);
 if(query.min!=='')parts.push('Mínimo: '+query.min+' votos');
 if(query.max!=='')parts.push('Máximo: '+query.max+' votos');
 const active=rules.filter(r=>r.value.trim());
 if(active.length)parts.push('Condições ('+(query.logic==='or'?'OU':'E')+'): '+active.map(r=>`${fields[r.field]} ${operators[r.op].toLowerCase()} ${r.value}`).join(query.logic==='or'?' OU ':' E '));
 parts.push('Ordenação: '+$('sort').selectedOptions[0].textContent);
 return parts.join(' · ');
}
function readQuery(){return {search:$('search').value.trim(),municipio:$('municipio').value,min:$('min').value,max:$('max').value,sort:$('sort').value,logic:$('logic').value,rules};}
function urlForQuery(){
 const url=new URL(location.href);url.search='';
 url.searchParams.set('visao',view);
 for(const key of ['search','municipio','min','max','sort','logic'])if(query[key]!=='')url.searchParams.set(key,query[key]);
 if(rules.length)url.searchParams.set('condicoes',JSON.stringify(rules));
 url.hash='explorar';return url;
}
function focusMunicipality(code){view='zonas';$('municipio').value=code;$('search').value='';$('min').value='';$('max').value='';rules=[];drawRules();update();$('explorar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function renderTable(){
 const isZone=view==='zonas',last=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,last);
 $('table-head').innerHTML=`<tr><th>${isZone?'Município / zona':'Município'}</th><th class="num">Votos</th><th class="num">% estadual${isZone?'<br>% municipal':''}</th></tr>`;
 $('table-body').innerHTML=rows.slice((page-1)*pageSize,page*pageSize).map(row=>{
 const municipal=municipios.find(m=>m.codigoMunicipio===row.codigoMunicipio).votos;
 return `<tr><td>${isZone?`<strong>${escape(row.municipio)}</strong><span class="secondary">Zona ${row.zona}</span>`:`<button class="municipio-button" data-municipio="${row.codigoMunicipio}" aria-label="Ver zonas de ${escape(row.municipio)}">${escape(row.municipio)}</button>`}<a href="${escape(row.fonte)}" target="_blank" rel="noopener noreferrer" aria-label="Fonte TSE: ${escape(row.municipio)}${isZone?' zona '+row.zona:''}">Fonte TSE</a></td><td class="num"><strong>${number.format(row.votos)}</strong></td><td class="num">${percent.format(row.votos/meta.totalVotos)}${isZone?`<span class="secondary">${percent.format(row.votos/municipal)} municipal</span>`:''}</td></tr>`;
 }).join('');
 $('empty').hidden=rows.length>0;$('page-label').textContent=rows.length?`${(page-1)*pageSize+1}–${Math.min(page*pageSize,rows.length)} de ${rows.length}`:'0 resultados';
 $('page-count').textContent=`Página ${page} de ${last}`;$('prev').disabled=page===1;$('next').disabled=page===last;
 $('table-body').querySelectorAll('[data-municipio]').forEach(button=>button.addEventListener('click',()=>focusMunicipality(button.dataset.municipio)));
}
function update(reset=true){
 if(reset)page=1;query=readQuery();rows=filterRows(view==='municipios'?municipios:zonas,query,meta.totalVotos);
 $('view-mun').setAttribute('aria-pressed',String(view==='municipios'));$('view-zone').setAttribute('aria-pressed',String(view==='zonas'));
 const total=rows.reduce((sum,r)=>sum+r.votos,0);
 $('selection-total').textContent=number.format(total);$('selection-share').textContent=percent.format(total/meta.totalVotos);$('selection-count').textContent=number.format(rows.length);
 $('count-label').textContent=view==='zonas'?'Recortes de município e zona':'Municípios';
 $('query-description').textContent=description();$('export').disabled=pdfBusy||!rows.length;
 const best=[...rows].sort((a,b)=>b.votos-a.votos||a.municipio.localeCompare(b.municipio,'pt-BR')).slice(0,10),max=best[0]?.votos??1;
 $('chart').innerHTML=best.length?best.map(r=>`<div class="bar-row"><div class="bar-label"><span>${escape(r.municipio)}${view==='zonas'?` · Zona ${r.zona}`:''}</span><strong>${number.format(r.votos)}</strong></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${r.votos/max*100}%"></div></div></div>`).join(''):'<p class="muted">Sem resultados neste recorte.</p>';
 renderTable();
}
function drawRules(){
 $('rules').innerHTML=rules.map((r,i)=>`<div class="rule"><label>Campo<select data-rule="${i}" data-key="field">${Object.entries(fields).map(([v,label])=>`<option value="${v}"${r.field===v?' selected':''}>${label}</option>`).join('')}</select></label><label>Comparação<select data-rule="${i}" data-key="op">${Object.entries(operators).map(([v,label])=>`<option value="${v}"${r.op===v?' selected':''}>${label}</option>`).join('')}</select></label><label>Valor<input data-rule="${i}" data-key="value" value="${escape(r.value)}" type="${r.field==='municipio'?'text':'number'}"${r.field==='municipio'?'':' min="0" step="any"'}></label><button class="outline remove" data-remove="${i}" aria-label="Remover condição ${i+1}">Remover</button></div>`).join('');
 $('rules').querySelectorAll('[data-rule]').forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',()=>{
   const r=rules[Number(el.dataset.rule)];r[el.dataset.key]=el.value;
   if(el.dataset.key==='field'){r.op=el.value==='municipio'?'contains':'gte';r.value='';drawRules();}
   update();
 }));
 $('rules').querySelectorAll('[data-remove]').forEach(el=>el.addEventListener('click',()=>{rules.splice(Number(el.dataset.remove),1);drawRules();update();}));
}
async function exportPdf(){
 const snapshot=rows.map(r=>({...r})),text=description(),snapshotView=view;
 pdfBusy=true;$('export').textContent='Preparando PDF…';$('export').disabled=true;$('feedback').textContent='';
 try{
   const bytes=await createReport(meta,[{title:snapshotView==='zonas'?'Resultados por município e zona':'Resultados por município',rows:snapshot}],text);
   const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='bebeto-2026-consulta.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
   $('feedback').textContent='PDF gerado com os filtros e as fontes desta consulta.';
 }catch(e){$('feedback').textContent='Não foi possível gerar o PDF. Tente novamente ou baixe o relatório completo.';console.error(e);}
 finally{pdfBusy=false;$('export').textContent='Baixar PDF da consulta';$('export').disabled=!rows.length;}
}
async function start(){
 try{
  [meta,municipios,zonas]=await Promise.all(['eleicao','municipios','zonas'].map(async name=>{const res=await fetch(`data/${name}.json`);if(!res.ok)throw new Error('Falha ao carregar dados');return res.json();}));
  if(municipios.length!==92||zonas.length!==183||[municipios,zonas].some(list=>list.reduce((s,r)=>s+r.votos,0)!==meta.totalVotos))throw new Error('Os totais não conferem com a versão dos dados.');
  $('state-total').textContent=number.format(meta.totalVotos);$('version').textContent=meta.versao;
  $('official').href=meta.resultadoEstadual;$('configuration').href=meta.configuracao;$('documentation').href=meta.documentacao;
  $('municipio').innerHTML+=[...municipios].sort((a,b)=>a.municipio.localeCompare(b.municipio,'pt-BR')).map(r=>`<option value="${r.codigoMunicipio}">${escape(r.municipio)}</option>`).join('');
  $('top-three').innerHTML=[...municipios].sort((a,b)=>b.votos-a.votos).slice(0,3).map((r,i)=>`<article class="rank-card"><span class="rank-number">${i+1}ª CONCENTRAÇÃO</span><h3>${escape(r.municipio)}</h3><div class="rank-votes">${number.format(r.votos)} <small>votos</small></div><p>${percent.format(r.votos/meta.totalVotos)} do total estadual</p><button data-municipio="${r.codigoMunicipio}">Ver votação por zona</button></article>`).join('');
  $('top-three').querySelectorAll('button').forEach(el=>el.addEventListener('click',()=>focusMunicipality(el.dataset.municipio)));
  const params=new URLSearchParams(location.search);view=params.get('visao')==='zonas'?'zonas':'municipios';
  for(const key of ['search','municipio','min','max','sort','logic'])if(params.has(key))$(key).value=params.get(key);
  if(!$('sort').value)$('sort').value='desc';if(!$('logic').value)$('logic').value='and';
  try{const parsed=JSON.parse(params.get('condicoes')||'[]');if(Array.isArray(parsed))rules=parsed.slice(0,30).filter(r=>r&&fields[r.field]&&operators[r.op]).map(r=>({field:r.field,op:r.op,value:String(r.value??'').slice(0,150)}));}catch{}
  drawRules();
  for(const id of ['search','municipio','min','max','sort','logic'])$(id).addEventListener(['search','min','max'].includes(id)?'input':'change',()=>update());
  $('view-mun').addEventListener('click',()=>{view='municipios';rules=rules.filter(r=>r.field!=='zona');drawRules();update();});
  $('view-zone').addEventListener('click',()=>{view='zonas';update();});
  $('add-rule').addEventListener('click',()=>{rules.push({field:'votos',op:'gte',value:''});drawRules();$('rules').lastElementChild.querySelector('input').focus();});
  $('clear').addEventListener('click',()=>{for(const id of ['search','municipio','min','max'])$(id).value='';$('sort').value='desc';$('logic').value='and';rules=[];drawRules();$('feedback').textContent='';update();history.replaceState(null,'',location.pathname+'#explorar');});
  $('filter-toggle').addEventListener('click',()=>{const hidden=!$('filter-panel').hidden;$('filter-panel').hidden=hidden;$('filter-toggle').setAttribute('aria-expanded',String(!hidden));$('filter-toggle').textContent=hidden?'Mostrar filtros':'Ocultar filtros';});
  $('prev').addEventListener('click',()=>{page--;renderTable();});$('next').addEventListener('click',()=>{page++;renderTable();});
  $('share').addEventListener('click',async()=>{const url=urlForQuery();history.replaceState(null,'',url);try{await navigator.clipboard.writeText(url.href);$('feedback').textContent='Link da consulta copiado. Os filtros estão incluídos.';}catch{$('feedback').textContent='Os filtros foram salvos no endereço da página. Copie o endereço do navegador para compartilhar.';}});
  $('export').addEventListener('click',exportPdf);update();$('loading').hidden=true;$('app').hidden=false;
 }catch(e){$('loading').textContent='Não foi possível carregar e conferir os dados. Recarregue a página para tentar novamente.';console.error(e);}
}
start();
