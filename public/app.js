import {normalizeQuery,selectRows,zoneOptions} from './filters.js';
import {createReport} from './pdf.js';
const $=id=>document.getElementById(id);
const number=new Intl.NumberFormat('pt-BR');
const percent=new Intl.NumberFormat('pt-BR',{style:'percent',minimumFractionDigits:2,maximumFractionDigits:2});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let meta,municipios,zonas,view='municipios',rows=[],page=1,query={},pdfBusy=false;
const pageSize=20;
function description(){
 const parts=[view==='zonas'?'Visão por município e zona':'Visão por município'];
 if(query.municipio)parts.push('Município: '+municipios.find(m=>m.codigoMunicipio===query.municipio).municipio);
 if(query.zona)parts.push('Zona: '+query.zona);
 parts.push(query.ranking==='all'?'Todos os resultados':`As ${query.ranking} maiores votações`);
 parts.push('Ordenação: '+$('sort').selectedOptions[0].textContent);
 return parts.join(' · ');
}
function readQuery(){return {view,municipio:$('municipio').value,zona:$('zona').value,ranking:$('ranking').value,sort:$('sort').value};}
function urlForQuery(){
 const url=new URL(location.href);url.search='';url.searchParams.set('visao',view);
 for(const key of ['municipio','zona','ranking','sort'])if(query[key]!=='')url.searchParams.set(key,query[key]);
 url.hash='explorar';return url;
}
function syncZoneChoices(){
 const available=zoneOptions(query,zonas);$('zona').disabled=!available.length;
 $('zona').innerHTML='<option value="">'+(available.length?'Todas as zonas do município':'Escolha um município na visão por zona')+'</option>'+available.map(zone=>`<option value="${zone}">Zona ${zone}</option>`).join('');
 $('zona').value=query.zona;
 $('zone-help').textContent=available.length?'As zonas listadas pertencem ao município selecionado.':'Para escolher uma zona, selecione um município na visão por zona.';
}
function focusMunicipality(code){view='zonas';$('municipio').value=code;$('zona').value='';$('ranking').value='all';$('sort').value='desc';update();$('explorar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
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
 if(reset)page=1;const result=selectRows(municipios,zonas,readQuery());query=result.query;rows=result.rows;view=query.view;$('municipio').value=query.municipio;$('ranking').value=query.ranking;$('sort').value=query.sort;syncZoneChoices();
 $('view-mun').setAttribute('aria-pressed',String(view==='municipios'));$('view-zone').setAttribute('aria-pressed',String(view==='zonas'));
 const total=rows.reduce((sum,r)=>sum+r.votos,0);
 $('selection-total').textContent=number.format(total);$('selection-share').textContent=percent.format(total/meta.totalVotos);$('selection-count').textContent=number.format(rows.length);
 $('count-label').textContent=view==='zonas'?'Recortes de município e zona':'Municípios';
 $('query-description').textContent=description();$('export').disabled=pdfBusy||!rows.length;
 const best=[...rows].sort((a,b)=>b.votos-a.votos||a.municipio.localeCompare(b.municipio,'pt-BR')).slice(0,10),max=best[0]?.votos??1;
 $('chart').innerHTML=best.length?best.map(r=>`<div class="bar-row"><div class="bar-label"><span>${escape(r.municipio)}${view==='zonas'?` · Zona ${r.zona}`:''}</span><strong>${number.format(r.votos)}</strong></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${r.votos/max*100}%"></div></div></div>`).join(''):'<p class="muted">Sem resultados neste recorte.</p>';
 renderTable();
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
  const params=new URLSearchParams(location.search);
  query=normalizeQuery({view:params.get('visao'),municipio:params.get('municipio'),zona:params.get('zona'),ranking:params.get('ranking'),sort:params.get('sort')},municipios,zonas);
  view=query.view;$('municipio').value=query.municipio;$('ranking').value=query.ranking;$('sort').value=query.sort;syncZoneChoices();
  $('municipio').addEventListener('change',()=>{$('zona').value='';update();});
  for(const id of ['zona','ranking','sort'])$(id).addEventListener('change',()=>update());
  $('view-mun').addEventListener('click',()=>{view='municipios';$('zona').value='';update();});
  $('view-zone').addEventListener('click',()=>{view='zonas';update();});
  $('clear').addEventListener('click',()=>{$('municipio').value='';$('zona').value='';$('sort').value='desc';$('ranking').value='all';$('feedback').textContent='';update();try{history.replaceState(null,'',location.pathname+'#explorar');}catch{}});
  $('filter-toggle').addEventListener('click',()=>{const hidden=!$('filter-panel').hidden;$('filter-panel').hidden=hidden;$('filter-toggle').setAttribute('aria-expanded',String(!hidden));$('filter-toggle').textContent=hidden?'Mostrar filtros':'Ocultar filtros';});
  $('prev').addEventListener('click',()=>{page--;renderTable();});$('next').addEventListener('click',()=>{page++;renderTable();});
  $('share').addEventListener('click',async()=>{const url=urlForQuery();try{history.replaceState(null,'',url);}catch{}try{await navigator.clipboard.writeText(url.href);$('feedback').textContent='Link da consulta copiado. Os filtros estão incluídos.';}catch{$('feedback').textContent='Os filtros foram salvos no endereço da página. Copie o endereço do navegador para compartilhar.';}});
  $('export').addEventListener('click',exportPdf);update();$('loading').hidden=true;$('app').hidden=false;
 }catch(e){$('loading').textContent='Não foi possível carregar e conferir os dados. Recarregue a página para tentar novamente.';console.error(e);}
}
start();
