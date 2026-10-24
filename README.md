# Strava Heatmap → JOSM

Extensão Chrome que gera a URL TMS do [Strava Global Heatmap](https://www.strava.com/maps/global-heatmap) para o JOSM (e iD, QGIS etc.), **sem precisar de header de cookie**: a assinatura CloudFront vai na própria URL (`?Key-Pair-Id=…&Policy=…&Signature=…`).

## Instalação

1. Baixe/clone este repositório.
2. Abra `chrome://extensions` e ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta do repositório.

## Uso

1. Abra o heatmap do Strava logado e dê zoom no mapa.
2. Clique no ícone da extensão. Ela lê os cookies `CloudFront-*`, monta a URL e testa um tile sem cookies (✔ = funcionando).
3. **Copiar para JOSM** → JOSM: *Preferências → Imagens → + TMS* → cole.

A URL gerada:

```
tms[3,15]:https://content-a.strava.com/identified/globalheat/{sport}/{color}/{zoom}/{x}/{y}.png?Key-Pair-Id=…&Policy=…&Signature=…
```

## Observações

- A assinatura expira em ~24h; depois é só abrir o heatmap e gerar de novo.
- A URL gerada funciona como credencial da sua sessão enquanto válida: não compartilhe.
- A extensão só tem permissão de cookies em `*.strava.com`.
