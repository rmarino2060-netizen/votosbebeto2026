import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {normalizeQuery,selectRows,zoneOptions} from '../public/filters.js';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../public/data/${name}.json`,import.meta.url)));
const municipalities=read('municipios'),zones=read('zonas'),meta=read('eleicao');
const base={view:'municipios',municipio:'',zona:'',ranking:'all',sort:'desc'};
test('As duas granularidades fecham no total e as zonas fecham em cada município',()=>{
 assert.equal(municipalities.length,92);assert.equal(zones.length,183);
 for(const rows of [municipalities,zones])assert.equal(rows.reduce((s,r)=>s+r.votos,0),meta.totalVotos);
 assert.equal(new Set(zones.map(r=>r.codigoMunicipio+':'+r.zona)).size,zones.length);
 for(const m of municipalities)assert.equal(zones.filter(z=>z.codigoMunicipio===m.codigoMunicipio).reduce((s,r)=>s+r.votos,0),m.votos);
 for(const r of [...municipalities,...zones]){assert.ok(Number.isInteger(r.votos)&&r.votos>=0);assert.equal(new URL(r.fonte).hostname,'resultados.tse.jus.br');}
});
test('Todas as combinações oferecidas pelos filtros têm resultados válidos',()=>{
 for(const municipio of ['',...municipalities.map(m=>m.codigoMunicipio)]){
  for(const view of ['municipios','zonas']){
   const query=normalizeQuery({...base,municipio,view},municipalities,zones);
   for(const zona of ['',...zoneOptions(query,zones).map(String)]){
    for(const ranking of ['all','3','10','20'])for(const sort of ['desc','asc','name']){
     const result=selectRows(municipalities,zones,{...query,zona,ranking,sort});
     assert.ok(result.rows.length>0);
     if(municipio)assert.ok(result.rows.every(r=>r.codigoMunicipio===municipio));
     if(zona)assert.ok(result.rows.every(r=>String(r.zona)===zona));
     if(ranking!=='all')assert.ok(result.rows.length<=Number(ranking));
    }
   }
  }
 }
});
test('Zona incompatível e parâmetros antigos/malformados voltam a escolhas válidas',()=>{
 const result=selectRows(municipalities,zones,{view:'zonas',municipio:'59013',zona:'999999',ranking:'-1',sort:'invalid',min:'999999',rules:[{field:'invalid'}]});
 assert.equal(result.query.zona,'');assert.equal(result.query.ranking,'all');
 assert.equal(result.rows.length,4);assert.equal(result.rows.reduce((s,r)=>s+r.votos,0),20717);
 assert.equal(selectRows(municipalities,zones,{municipio:'unknown',view:'unknown'}).rows.length,92);
 assert.equal(selectRows(municipalities,zones,null).rows.length,92);
 assert.equal(normalizeQuery({view:'municipios',municipio:'59013',zona:'89'},municipalities,zones).zona,'');
});
test('Ranking seleciona as maiores votações antes de aplicar a ordem de apresentação',()=>{
 const top=selectRows(municipalities,zones,{...base,ranking:'3'}).rows;
 assert.deepEqual(top.map(r=>r.votos),[20717,3214,2658]);
 const asc=selectRows(municipalities,zones,{...base,ranking:'3',sort:'asc'}).rows;
 assert.deepEqual(asc.map(r=>r.votos),[2658,3214,20717]);
 assert.equal(selectRows(municipalities,zones,{view:'zonas',municipio:'59013',zona:'89'}).rows[0].votos,9429);
});
