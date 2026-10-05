import http from 'node:http';import path from 'node:path';import {readFile,stat} from 'node:fs/promises';
const root=path.resolve(process.argv[2]??'public');const port=Number(process.env.PORT??8080);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.pdf':'application/pdf','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  const url=new URL(req.url,'http://localhost');const name=decodeURIComponent(url.pathname);
  if(name.includes('\\')||name.includes('\0'))throw Error('Caminho inválido');
  let file=path.resolve(root,'.'+name);if(file!==root&&!file.startsWith(root+path.sep))throw Error('Caminho inválido');
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const bytes=await readFile(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Arquivo não encontrado.');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'A porta 8080 está ocupada. Encerre o servidor anterior com Ctrl+C.':error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Site em http://localhost:${server.address().port}\nPasta: ${root}\nPara encerrar, pressione Ctrl+C.`));
