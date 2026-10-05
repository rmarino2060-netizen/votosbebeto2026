# Votos Bebeto Federal - 2026

Site estático e responsivo de análise independente da votação de Bebeto (1133, PP), deputado federal pelo Rio de Janeiro. Base extraída dos arquivos oficiais do TSE em 05/10/2026. Não é um serviço oficial do TSE.

## Conteúdo

- Total estadual: 52.761 votos.
- 92 municípios e 183 combinações de município e zona eleitoral.
- Três maiores concentrações estaduais, consulta por município/zona, busca sem acentos, filtros numéricos, condições E/OU, ranking, paginação e links oficiais.
- PDF completo e geração local de PDF da consulta. Biblioteca de PDF incluída no projeto, sem CDN ou serviço externo.
- Compartilhamento da consulta por parâmetros no endereço. Sem rastreamento, contas de visitantes ou banco em servidor.

Zona não equivale a bairro. Seções, locais de votação, endereços e limites territoriais não fazem parte da base atual. Não inferir residência nem identidade dos eleitores.

## Organização

`public/data/`: metadados e bases JSON. `public/index.html`, `styles.css`, `app.js`: interface. `filters.js`: consulta. `pdf.js`: relatório. `public/relatorios/`: PDF completo e relatório original com todas as fontes. `public/vendor/`: pdf-lib 1.17.1 (MIT).

## Desenvolvimento

Requer Node.js 18 ou superior para build e testes; o site publicado não usa Node ou servidor próprio. Não é necessário instalar dependências.

```sh
npm test
npm run build
```

Para abrir localmente, sirva a pasta `dist` por HTTP (não por `file://`). Por exemplo, com Python instalado:

```sh
npm run preview
```

Acesse http://localhost:8080. Para regenerar o PDF completo após mudar os dados: `node scripts/report.mjs`, seguido de `npm run build`.

## Publicação na sua conta Cloudflare Pages

Crie um projeto **Pages** com integração Git e selecione este repositório. Configuração:

| Campo | Valor |
|---|---|
| Nome pretendido | votosbebeto2026 |
| Branch de produção | main |
| Framework | None |
| Comando de build | npm run build |
| Diretório de saída | dist |
| Diretório raiz | / (raiz do repositório) |

Use o plano gratuito. Não é necessário comprar domínio nem contratar recursos pagos. O endereço pretendido é `votosbebeto2026.pages.dev`, sujeito à disponibilidade. O projeto Pages e o repositório devem continuar na conta do proprietário. Não envie senha ou token em arquivos ou mensagens.

A publicação deve acontecer depois da revisão do site. Após conectar, novos commits na branch de produção poderão disparar novos deploys. Use branches/PRs para revisar alterações antes de atualizar `main`.

## Manutenção dos dados

Para revisões, atualize os JSONs com resultados oficiais, preserve as URLs das fontes, altere `dataColeta` e `versao` e rode os testes. Regere o PDF completo e o relatório de fontes para não manter versões divergentes. Os testes exigem a estrutura e o total desta eleição; se o TSE revisar o total, atualize os controles conscientemente e documente o motivo. Não misture pleitos, candidatos ou turnos.

Fonte estadual: https://resultados.tse.jus.br/oficial/ele2026/6259/dados/rj/rj-c0006-e006259-u.json

Configuração municipal: https://resultados.tse.jus.br/oficial/ele2026/6259/config/mun-e006259-cm.json

Cada registro de resultado contém sua própria URL oficial. Percentuais são calculados sobre os votos do candidato; não sobre todos os votos válidos da localidade. Municípios e zonas são duas visões dos mesmos votos e não devem ser somados entre si.
