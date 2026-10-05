import {readFile,writeFile} from 'node:fs/promises';
import {createReport} from '../public/pdf.js';
globalThis.self = globalThis;
const data=async name=>JSON.parse(await readFile(`public/data/${name}.json`,'utf8'));
const [meta,mun,zones]=await Promise.all(['eleicao','municipios','zonas'].map(data));
await writeFile('public/relatorios/relatorio-completo.pdf',await createReport(meta,[{title:'Votos por município',rows:mun},{title:'Votos por município e zona',rows:zones}],'Relatório completo: inclui todos os municípios e recortes por zona, em ordem decrescente de votos.'));
console.log('Relatório completo gerado.');
