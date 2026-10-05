# Documentação da aplicação — Votos Bebeto Federal 2026

Documento funcional, técnico e operacional. Revisão: 05/10/2026.

## 1. Referência e estado observado

Repositório: https://github.com/rmarino2060-netizen/votosbebeto2026  
Endereço de publicação: https://votosbebeto2026.pages.dev  
Versão do pacote: 1.1.0. Versão da base: 2026-10-05.1.  
Código de referência: ecda2e9672fe0467e49bd29d98cbf9a9bb1d1dc6, commit “Use light theme as the default”.

A revisão consultou o commit atual no GitHub e comparou os hashes dos arquivos locais com a árvore remota. A única diferença local era o tema; a implementação remota foi lida separadamente. Os arquivos dos testes, dos dados e do build eram idênticos aos remotos. Os quatro testes passaram e o build concluiu.

O proprietário relatou conclusão da implantação após repetir a criação do projeto Pages. Nesta revisão, a página inicial respondeu HTTP 200 e entregou HTML da aplicação. Tentativas adicionais de consultar arquivos individuais retornaram HTTP 403 neste ambiente. Não foi possível confirmar correspondência integral entre publicação e commit; isso tampouco demonstra falha para visitantes. A resposta inicial não equivale a homologação visual ou funcionamento de todos os botões. Não houve acesso ao painel privado da Cloudflare nem auditoria visual em navegador nesta revisão.

## 2. Objetivo, público e limites

O aplicativo organiza a votação atribuída a Bebeto, número 1133, deputado federal pelo RJ, em uma consulta pública por município e por combinação de município e zona eleitoral. Serve a leitores que querem compreender a distribuição dos votos, consultar fontes e exportar relatórios.

É uma análise independente. O site e os PDFs não são serviços nem documentos emitidos pelo TSE. A base do repositório declara origem nos resultados do TSE; esta revisão verifica sua consistência interna e implementação, sem refazer a coleta dos arquivos oficiais.

Não há apuração ao vivo, consulta de eleitores individuais, comparação com outros candidatos, mapa territorial, bairros, seções ou endereços de locais de votação. Uma zona não identifica automaticamente um bairro, e o lugar de registro do voto não comprova residência.

## 3. Conteúdo da base

| Informação | Valor armazenado |
|---|---|
| Nome de urna | Bebeto |
| Nome civil | Carlos Roberto Rodrigues |
| Número e partido | 1133 — PP |
| Cargo / UF | Deputado federal / RJ |
| Eleição / turno | 2026 / primeiro |
| Data declarada da eleição | 04/10/2026 |
| Coleta declarada | 05/10/2026 |
| Identificador do candidato | 190002541063 |
| Total estadual | 52.761 votos |
| Municípios | 92 registros |
| Município e zona | 183 registros |

As três maiores concentrações municipais armazenadas são São João de Meriti (20.717), Rio de Janeiro (3.214) e Belford Roxo (2.658). São João de Meriti possui os recortes de zona 89 (9.429), 187 (4.977), 186 (4.804) e 88 (1.507).

As duas granularidades representam os mesmos votos. Não se deve somar municípios com zonas. A chave de um recorte detalhado é a combinação código do município + zona; número de zona isolado não é tratado como identificador de uma linha.

## 4. Jornada de consulta e comportamento

A página apresenta identificação do candidato, total estadual, cobertura da base e três maiores concentrações municipais. Esses destaques estaduais não mudam com os filtros.

Na área “Sua consulta”, o visitante escolhe a visão por município ou por município e zona. Pode selecionar um município, limitar aos 3, 10 ou 20 maiores resultados e ordenar por mais votos, menos votos ou nome do município. O seletor de zona só é habilitado na visão por zona com município selecionado; suas opções pertencem àquele município. Trocar o município limpa a zona anterior.

Clicar em um município da tabela ou em “Ver votação por zona” abre seu detalhamento, limpa a limitação de ranking e ordena por mais votos. “Ver todos os resultados” limpa os filtros e mantém a visão atual. Ocultar filtros apenas recolhe os controles, sem apagar a seleção.

A seleção alimenta três indicadores: soma dos votos, participação no total estadual e quantidade de registros. O gráfico mostra até dez maiores resultados do recorte; sua ordem continua decrescente mesmo quando a tabela é ordenada de outra forma. A tabela pagina de vinte em vinte linhas.

O ranking é aplicado antes da ordem de apresentação. Portanto, “3 maiores” com “menos votos primeiro” mostra os mesmos três maiores, em ordem crescente; não seleciona os três menores.

### Percentuais

- Estadual: votos da linha ÷ total estadual do candidato × 100.
- Municipal, na visão por zona: votos da linha ÷ total do candidato naquele município × 100.
- Seleção: soma das linhas selecionadas ÷ total estadual do candidato × 100.

Esses percentuais não representam a participação do candidato entre todos os candidatos da localidade. São formatados em português brasileiro com duas casas decimais. A largura das barras usa o maior resultado do gráfico como referência visual, não o total estadual.

### Compartilhamento

O botão gera um endereço com `visao`, `municipio`, `zona`, `ranking` e `sort`, apontando para `#explorar`. O código tenta copiar o link; se não conseguir, orienta copiar a barra de endereço. A página atual da tabela e o tema não fazem parte do link.

Valores desconhecidos ou incompatíveis são normalizados para escolhas válidas. A interface não oferece regras livres de consulta. Isso evita combinações inválidas nos controles previstos; não elimina falhas de rede ou arquivos corrompidos.

## 5. Tema, celular e acessibilidade

O tema inicial é claro, independentemente do tema do sistema operacional. Uma escolha anterior válida em `localStorage`, na chave `votosbebeto-theme`, tem prioridade. O botão alterna entre claro e escuro e tenta persistir a preferência. Se o armazenamento estiver indisponível, a alternância continua funcionando na sessão.

A interface utiliza viewport mobile, CSS responsivo, quebra dos controles em telas estreitas e área de rolagem para a tabela. Há rótulos nos campos, link para pular à consulta, estados ARIA nos botões, mensagens de status e respeito à preferência de movimento reduzido no deslocamento à consulta.

Esses recursos estão implementados, mas não constituem certificação de acessibilidade. A homologação deve incluir celular real, teclado, zoom, leitura das tabelas e contraste nos dois temas.

## 6. Relatórios e downloads

O PDF completo fica em `public/relatorios/relatorio-completo.pdf`. Seu download não depende de recalcular os filtros. Já o PDF da consulta é gerado no navegador com todas as linhas selecionadas, inclusive as que não estão na página visível da tabela.

O gerador captura uma cópia da seleção ao iniciar, evitando que mudanças posteriores nos filtros alterem aquele relatório. O documento informa contexto, totais, percentuais, limitações e fontes. Erros de geração produzem mensagem e liberam nova tentativa.

A biblioteca pdf-lib 1.17.1 está incluída em `public/vendor/`, acompanhada da licença MIT. Não é baixada de uma CDN. Os dados do relatório são processados localmente no navegador.

Também existem downloads dos JSONs municipal e por zona, além do relatório de fontes em Markdown. O PDF completo precisa ser regenerado explicitamente após revisão dos dados; executar apenas o build não o atualiza.

## 7. Arquitetura técnica

A aplicação é estática, com HTML, CSS e JavaScript em módulos ES. Não usa framework de interface, API própria, autenticação de visitantes nem servidor de banco de dados. Node.js serve ao desenvolvimento, build e testes; não é necessário um processo Node em produção.

| Arquivo ou diretório | Responsabilidade |
|---|---|
| `public/index.html` | Estrutura, controles e textos institucionais |
| `public/styles.css` | Layout, responsividade e paletas |
| `public/app.js` | Carregamento, estado da consulta, eventos e renderização |
| `public/filters.js` | Normalização, opções de zona, filtro e ordenação |
| `public/theme.js` | Tema inicial, alternância e persistência |
| `public/pdf.js` | Composição e geração de PDFs |
| `public/data/` | Metadados e registros JSON |
| `public/relatorios/` | Relatórios preparados para download |
| `public/vendor/` | Dependência de PDF e licença |
| `public/_headers` | Cabeçalhos de segurança da hospedagem |
| `scripts/build.mjs` | Recria dist e copia public |
| `scripts/serve.mjs` | Servidor HTTP de desenvolvimento/prévia |
| `scripts/report.mjs` | Regenera o PDF completo |
| `tests/data.test.mjs` | Testes de consistência e consultas |

Na abertura, `app.js` busca os três JSONs em paralelo na própria hospedagem. Confere quantidades e totais, popula os seletores, normaliza parâmetros do endereço, registra eventos e renderiza a consulta. Após esse carregamento, filtros e paginação operam em memória, sem consultar o TSE.

Falhas de carregamento ou divergência nas conferências iniciais deixam uma mensagem de erro em vez de liberar a área de consulta.

## 8. Modelo de dados e armazenamento

São arquivos JSON versionados no Git, não um banco SQLite nem um arquivo SQL.

| Arquivo | Estrutura e finalidade |
|---|---|
| `eleicao.json` | Objeto com candidato, pleito, datas, versão, total e fontes gerais |
| `municipios.json` | Array: municipio, codigoMunicipio, votos, fonte |
| `zonas.json` | Mesmos campos, acrescidos de zona |

`codigoMunicipio` é string; `votos` e `zona` são números. Não se deve presumir que o código eleitoral seja um código IBGE. `fonte` registra a URL de origem atribuída à linha.

Os arquivos municipal e por zona possuem respectivamente 18.008 e 40.032 bytes na versão revisada, antes de compressão de transporte. A duplicação parcial simplifica leitura e consulta, mas exige manter as duas granularidades consistentes.

Não existe pipeline de extração do TSE no repositório. Os scripts presentes publicam arquivos e geram PDF; a coleta e transformação precisam ser documentadas/reproduzidas separadamente se a base for atualizada.

## 9. Segurança e privacidade

O código próprio não implementa cadastro, analytics ou envio das consultas a uma API. A preferência de tema fica no navegador. Isso não equivale a afirmar que a infraestrutura de hospedagem não registre acessos.

A política CSP limita scripts e conexões à própria origem, bloqueia objetos incorporados e enquadramento por outras páginas. Estilos inline são permitidos, inclusive para as barras. Há cabeçalhos contra interpretação incorreta de tipos e política de referência. Links externos usam `noopener noreferrer`; textos inseridos como HTML passam por escape nos pontos de renderização previstos.

Essas medidas não substituem auditoria de segurança. Não armazenar credenciais dentro de public: seu conteúdo é copiado para a publicação.

## 10. Desenvolvimento e fluxo Git

O README declara Node.js 18 ou superior. Utilize uma versão mantida e compatível. O pacote não declara dependências npm; a biblioteca de PDF já está no repositório.

Para criar uma cópia conectada ao remoto:

```powershell
cd C:\_estudos
git clone https://github.com/rmarino2060-netizen/votosbebeto2026.git
cd votosbebeto2026
git remote -v
npm test
npm run dev
```

Abra http://localhost:8080. Uma pasta baixada como ZIP não possui automaticamente a conexão Git. O servidor serve public e não oferece atualização automática da página; recarregue o navegador após editar.

Para receber mudanças, dentro do clone:

```powershell
git status
git pull --ff-only
npm test
npm run dev
```

Encerre o servidor com Ctrl+C antes de iniciar outro na mesma porta. Resolva alterações locais ou divergências antes de continuar; não descarte trabalho para forçar o pull.

Para conferir a saída de publicação:

```powershell
npm run build
npm run preview
```

O build apaga e recria dist a partir de public. A mensagem “Site estático pronto em dist” significa conclusão da cópia, não abertura de um servidor. O preview serve dist. Não edite dist como fonte, pois o próximo build sobrescreve essa pasta.

Para desenvolver alterações, prefira uma branch, teste localmente, faça commit e push e revise o PR antes de incorporar em main.

## 11. Publicação e administração

O destino escolhido é Cloudflare Pages, com integração ao GitHub e subdomínio pages.dev, sem compra de domínio.

| Configuração do projeto | Valor acordado |
|---|---|
| Branch de produção | main |
| Framework | Nenhum |
| Build | npm run build |
| Diretório publicado | dist |
| Raiz | Raiz do repositório |

O formulário de Workers com `wrangler deploy` não é o fluxo escolhido. A administração do repositório e do projeto Cloudflare permanece nas contas do proprietário. As configurações efetivas de conta, plano e automação não foram auditadas nesta revisão.

No fluxo Git integrado, alterações na branch de produção podem disparar nova publicação. Confira no painel o commit associado à implantação e seu log antes de concluir que uma mudança já está no ar. Este projeto não contém workflow de GitHub Actions; os testes não são executados pelo comando de build. Portanto, sucesso do deploy não comprova aprovação da suíte de testes.

## 12. Testes e critérios de manutenção

Os quatro testes atuais verificam:

1. Contagem de registros, totais, soma por município, unicidade das combinações município/zona, votos inteiros não negativos e hostname das fontes.
2. Todas as combinações oferecidas pelos filtros com resultados válidos.
3. Normalização de parâmetros desconhecidos, antigos ou incompatíveis.
4. Seleção das maiores votações antes da ordenação e casos de referência.

Resultado desta revisão: quatro aprovados, zero falhas; build concluído. Os testes não confirmam autenticidade ou atualização do conteúdo nos servidores do TSE, nem exercitam navegador, download, layout mobile e painel Cloudflare.

Ao revisar os dados:

1. Confirme candidato, eleição, turno e origem dos arquivos.
2. Atualize os JSONs e preserve a rastreabilidade de cada registro.
3. Atualize versão e data de coleta, registrando motivo e fonte da revisão.
4. Revise textos fixos em index.html e pdf.js: datas, totais, contagens e URLs não são todos derivados dos metadados.
5. Atualize o relatório de fontes e execute `node scripts/report.mjs`.
6. Execute testes, build e preview; confira o PDF completo e o filtrado.
7. Revise o commit, publique e confirme os arquivos servidos.

A reutilização para outro candidato ou eleição exige adaptação além de trocar JSONs: há pressupostos fixos na interface, no PDF, na validação inicial e nos testes.

## 13. Diagnóstico rápido e pendências

| Sintoma | Verificação |
|---|---|
| “Missing script: dev” | Confirme pasta e versão do clone; atualize o remoto |
| Build termina sem abrir página | Execute dev ou preview conforme o objetivo |
| Porta ocupada | Encerre o servidor anterior ou configure PORT |
| Falha ao carregar os dados | Confira HTTP dos JSONs e consistência dos totais |
| Zona indisponível | Escolha visão por zona e depois município |
| PDF completo desatualizado | Regenere o arquivo; build apenas copia |
| Site remoto diferente do local | Confira commit publicado e branch conectada |
| Erro desconhecido ao criar Pages | Verifique se o projeto foi criado antes de repetir |

Pendências de verificação: homologação visual em celular e desktop, navegação por teclado, PDFs gerados em navegadores reais e conferência independente das fontes oficiais caso a aplicação seja submetida a auditoria de dados.

Possíveis evoluções, ainda não implementadas: extração reproduzível do TSE, testes automáticos antes do deploy, eliminação de textos fixos específicos do pleito e inclusão de seções/locais somente com correspondência oficial verificada.

## 14. Referências da revisão

- Código: https://github.com/rmarino2060-netizen/votosbebeto2026/tree/ecda2e9672fe0467e49bd29d98cbf9a9bb1d1dc6
- Metadados: public/data/eleicao.json.
- Fontes por registro: public/data/municipios.json e public/data/zonas.json.
- Relatório de origem incluído: public/relatorios/relatorio-fontes.md.
- URL estadual declarada: https://resultados.tse.jus.br/oficial/ele2026/6259/dados/rj/rj-c0006-e006259-u.json
- Configuração declarada: https://resultados.tse.jus.br/oficial/ele2026/6259/config/mun-e006259-cm.json

Esta documentação descreve a versão de referência. Mudanças futuras no código, nos dados ou na hospedagem devem atualizar também este documento.
