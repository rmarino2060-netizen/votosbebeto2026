// Apenas seleções predefinidas. Valores desconhecidos voltam a opções válidas.
export function normalizeQuery(input,municipios,zonas){
 const source=input??{};
 const view=source.view==='zonas'?'zonas':'municipios';
 const municipio=municipios.some(r=>r.codigoMunicipio===source.municipio)?source.municipio:'';
 const available=zonas.filter(r=>r.codigoMunicipio===municipio);
 const zona=view==='zonas'&&municipio&&available.some(r=>String(r.zona)===String(source.zona))?String(source.zona):'';
 return {view,municipio,zona,ranking:['3','10','20'].includes(String(source.ranking))?String(source.ranking):'all',sort:['asc','name'].includes(source.sort)?source.sort:'desc'};
}
export function zoneOptions(query,zonas){
 return query.view==='zonas'&&query.municipio?zonas.filter(r=>r.codigoMunicipio===query.municipio).map(r=>r.zona).sort((a,b)=>a-b):[];
}
export function selectRows(municipios,zonas,input){
 const query=normalizeQuery(input,municipios,zonas);
 let rows=(query.view==='zonas'?zonas:municipios).filter(row=>(!query.municipio||row.codigoMunicipio===query.municipio)&&(!query.zona||String(row.zona)===query.zona));
 const desc=(a,b)=>b.votos-a.votos||a.municipio.localeCompare(b.municipio,'pt-BR')||(a.zona??0)-(b.zona??0);
 rows.sort(desc);
 if(query.ranking!=='all')rows=rows.slice(0,Number(query.ranking));
 if(query.sort==='asc')rows.sort((a,b)=>a.votos-b.votos||a.municipio.localeCompare(b.municipio,'pt-BR'));
 if(query.sort==='name')rows.sort((a,b)=>a.municipio.localeCompare(b.municipio,'pt-BR')||(a.zona??0)-(b.zona??0));
 return {query,rows};
}
