export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function filterRows(rows, query, total) {
  return rows.filter(row => {
    if(query.search && !normalize(row.municipio).includes(normalize(query.search))) return false;
    if(query.municipio && row.codigoMunicipio !== query.municipio) return false;
    if(query.min !== '' && row.votos < Number(query.min)) return false;
    if(query.max !== '' && row.votos > Number(query.max)) return false;
    const rules=(query.rules ?? []).filter(rule=>String(rule.value).trim()!=='');
    const matches=rules.map(rule=>{
      const value=rule.field==='participacao' ? row.votos/total*100 : row[rule.field];
      if(rule.op==='contains') return normalize(value).includes(normalize(rule.value));
      if(rule.op==='eq') return normalize(value)===normalize(rule.value);
      if(rule.op==='gte') return value!==undefined && Number(value)>=Number(rule.value);
      if(rule.op==='lte') return value!==undefined && Number(value)<=Number(rule.value);
      return false;
    });
    return query.logic==='or' ? !matches.length || matches.some(Boolean) : matches.every(Boolean);
  }).sort((a,b)=>query.sort==='name' ? a.municipio.localeCompare(b.municipio,'pt-BR') || (a.zona??0)-(b.zona??0) : query.sort==='asc' ? a.votos-b.votos || a.municipio.localeCompare(b.municipio,'pt-BR') : b.votos-a.votos || a.municipio.localeCompare(b.municipio,'pt-BR'));
}
