import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {filterRows} from '../public/filters.js';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../public/data/${name}.json`,import.meta.url)));
const municipalities=read('municipios'),zones=read('zonas'),meta=read('eleicao');
const base={search:'',municipio:'',min:'',max:'',rules:[],sort:'desc',logic:'and'};
test('As duas granularidades fecham no total e as zonas fecham em cada município',()=>{
 assert.equal(municipalities.length,92);assert.equal(zones.length,183);
 for(const rows of [municipalities,zones])assert.equal(rows.reduce((s,r)=>s+r.votos,0),meta.totalVotos);
 assert.equal(new Set(zones.map(r=>r.codigoMunicipio+':'+r.zona)).size,zones.length);
 for(const m of municipalities)assert.equal(zones.filter(z=>z.codigoMunicipio===m.codigoMunicipio).reduce((s,r)=>s+r.votos,0),m.votos);
 for(const r of [...municipalities,...zones]){assert.ok(Number.isInteger(r.votos)&&r.votos>=0);assert.equal(new URL(r.fonte).hostname,'resultados.tse.jus.br');}
});
test('Busca sem acentos, filtros combinados E/OU e resultado vazio',()=>{
 assert.equal(filterRows(municipalities,{...base,search:'sao joao de meriti'},meta.totalVotos)[0].votos,20717);
 const rules=[{field:'municipio',op:'contains',value:'meriti'},{field:'municipio',op:'contains',value:'belford'}];
 assert.equal(filterRows(municipalities,{...base,rules,logic:'or'},meta.totalVotos).length,2);
 assert.equal(filterRows(municipalities,{...base,rules,logic:'and'},meta.totalVotos).length,0);
 assert.equal(filterRows(zones,{...base,municipio:'59013'},meta.totalVotos).reduce((s,r)=>s+r.votos,0),20717);
 assert.equal(filterRows(zones,{...base,rules:[{field:'zona',op:'eq',value:'89'}]},meta.totalVotos)[0].votos,9429);
 assert.equal(filterRows(municipalities,{...base,rules:[{field:'participacao',op:'gte',value:'39'}]},meta.totalVotos).length,1);
 assert.equal(filterRows(municipalities,{...base,min:'999999'},meta.totalVotos).length,0);
});
