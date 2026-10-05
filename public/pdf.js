export async function loadPdfLibrary(){
  if(globalThis.PDFLib)return globalThis.PDFLib;
  await import('./vendor/pdf-lib.min.js');
  if(!globalThis.PDFLib)throw new Error('Não foi possível carregar o gerador de PDF.');
  return globalThis.PDFLib;
}
export async function createReport(meta, groups, description, library){
  const {PDFDocument,StandardFonts,rgb}=library??await loadPdfLibrary();
  const doc=await PDFDocument.create();
  doc.setTitle(meta.titulo);doc.setAuthor('Votos Bebeto - análise independente');doc.setSubject('Votação por município e zona eleitoral - fontes TSE');
  const normal=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const navy=rgb(.06,.17,.26),muted=rgb(.32,.41,.48),teal=rgb(.03,.47,.42);
  let page,y;const width=595,height=842,margin=42,lineWidth=511;
  const clean=text=>String(text).replace(/[\u2010-\u2015]/g,'-').replace(/\u2192/g,'>').replace(/[^\u0020-\u00ff\n]/g,' ');
  function addPage(){page=doc.addPage([width,height]);y=height-margin;page.drawText('VOTOS BEBETO FEDERAL / 2026',{x:margin,y,size:10,font:bold,color:teal});y-=30;}
  function ensure(space){if(y-space<55)addPage();}
  function paragraph(text,{size=10,font=normal,color=navy,gap=10}={}){
    const words=clean(text).split(/\s+/).flatMap(word=>{
      if(font.widthOfTextAtSize(word,size)<=lineWidth)return [word];
      const chunks=[];let part='';
      for(const c of word){if(font.widthOfTextAtSize(part+c,size)>lineWidth){chunks.push(part);part=c;}else part+=c;}
      if(part)chunks.push(part);return chunks;
    });let line='';
    for(const word of words){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)>lineWidth&&line){ensure(size+5);page.drawText(line,{x:margin,y,size,font,color});y-=size+5;line=word;}else line=next;}
    if(line){ensure(size+5);page.drawText(line,{x:margin,y,size,font,color});y-=size+5;}y-=gap;
  }
  addPage();
  paragraph(meta.titulo,{size:23,font:bold});
  paragraph(`${meta.nomeCivil} | ${meta.nomeUrna} ${meta.numero} | ${meta.partido} | Deputado federal - RJ`);
  paragraph(`Eleição: 04/10/2026 - primeiro turno. Coleta: 05/10/2026. Versão: ${meta.versao}.`);
  paragraph('Relatório independente elaborado com dados oficiais do TSE. Não é um documento emitido pelo tribunal.',{color:muted});
  paragraph(`Total estadual de Bebeto: ${meta.totalVotos.toLocaleString('pt-BR')} votos.`,{size:14,font:bold});
  paragraph(description,{color:muted});
  paragraph('Participação estadual = votos do resultado / 52.761. Não representa a votação do candidato entre todos os candidatos da localidade. Municípios e zonas são visões dos mesmos votos; não somar as duas tabelas.');
  paragraph('Limite: zona eleitoral. Não inclui seção, bairro, endereço de cartório ou local de votação. O local de registro do voto não comprova a residência do eleitor. Esta versão não é atualizada em tempo real.');
  paragraph('Fontes: cada linha informa o nome de seu arquivo oficial. Para abrir a fonte, acrescente esse nome ao endereço-base abaixo:',{size:9,color:muted});
  paragraph('https://resultados.tse.jus.br/oficial/ele2026/6259/dados/rj/',{size:9,color:muted});
  for(const group of groups){
    ensure(90);paragraph(group.title,{size:15,font:bold});
    const total=group.rows.reduce((sum,r)=>sum+r.votos,0);
    paragraph(`${group.rows.length} resultados. Soma: ${total.toLocaleString('pt-BR')} votos (${(total/meta.totalVotos*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}% do total estadual).`,{size:10});
    for(const row of group.rows){
      ensure(52);
      const name=row.municipio+(row.zona!==undefined?` - Zona ${row.zona}`:'');
      paragraph(`${name}: ${row.votos.toLocaleString('pt-BR')} votos | ${(row.votos/meta.totalVotos*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}% do total estadual.`,{size:10,font:bold,gap:0});
      paragraph(`Fonte TSE: ${row.fonte.split('/').pop()}`,{size:9,color:muted,gap:8});
    }
  }
  ensure(100);paragraph('Conferência e fontes gerais',{size:15,font:bold});
  paragraph('Base completa: 92 municípios e 183 recortes de município e zona. Ambas as somas fecham em 52.761 votos. As zonas também foram conferidas contra o total de cada município. Os arquivos consultados estavam marcados como totalização finalizada. O TSE pode publicar revisões posteriores.');
  paragraph('Resultado estadual: '+meta.resultadoEstadual,{size:9});
  paragraph('Configuração oficial: '+meta.configuracao,{size:9});
  paragraph('Documentação técnica: '+meta.documentacao,{size:9});
  const pages=doc.getPages();pages.forEach((p,i)=>p.drawText(`Votos Bebeto Federal - versão ${meta.versao} | Página ${i+1} de ${pages.length}`,{x:margin,y:28,size:8,font:normal,color:muted}));
  return doc.save();
}
