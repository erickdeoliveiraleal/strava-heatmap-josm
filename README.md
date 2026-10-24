# Strava Heatmap → JOSM

Extensão Chrome que gera a URL TMS do [Strava Global Heatmap](https://www.strava.com/maps/global-heatmap) para o JOSM, com os cookies necessários já no header.

## Instalação

1. Baixe/clone este repositório.
2. Abra `chrome://extensions` e ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta do repositório.

## Uso

1. Abra o heatmap do Strava logado e dê zoom no mapa.
2. Clique no ícone da extensão. Ela lê os cookies (inclusive os HttpOnly), monta o link e testa um tile do jeito que o JOSM vai pedir (✔ = funcionando).
3. **Copiar para JOSM** → JOSM: *Preferências → Imagens → + TMS* → cole.

O link gerado:

```
tms[3,15]:https://content-a.strava.com/identified/globalheat/{sport}/{color}/{zoom}/{x}/{y}.png{header(Cookie,CloudFront-Key-Pair-Id=…;CloudFront-Policy=…;CloudFront-Signature=…;_strava_idcf=…)}
```

## Como funciona

O servidor de tiles exige quatro cookies: a assinatura CloudFront (`CloudFront-Key-Pair-Id`, `CloudFront-Policy`, `CloudFront-Signature`) e `_strava_idcf`. Só a assinatura não basta, e ela também não é aceita como parâmetro na URL (HTTP 401), por isso o link usa o `{header(...)}` do JOSM. Esses cookies são HttpOnly, então userscripts normalmente não conseguem lê-los; a extensão consegue porque tem permissão de cookies em `*.strava.com`.

Se o Strava mudar os cookies exigidos, a extensão detecta a falha no teste e descobre sozinha o novo conjunto mínimo.

## Observações

- Os cookies expiram em ~24h; depois é só abrir o heatmap e gerar de novo.
- O link gerado funciona como credencial da sua sessão enquanto válido: não compartilhe.
- A extensão só tem permissão de cookies em `*.strava.com`.
