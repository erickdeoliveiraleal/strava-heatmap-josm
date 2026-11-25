# Política de privacidade — Strava Heatmap → JOSM

_Última atualização: 25/11/2026_

## O que a extensão acessa

- **Cookies do domínio `strava.com`**: a extensão lê os cookies da sua sessão no Strava (assinatura CloudFront e `_strava_idcf`) apenas quando você abre o popup, para montar a URL TMS que o JOSM/iD usa para carregar o Global Heatmap.
- **URL da aba ativa**, somente se for uma página do `strava.com`, para reaproveitar a atividade e a cor escolhidas no heatmap.

## O que a extensão faz com esses dados

- Mostra a URL gerada no popup e, quando você clica em **Copiar**, copia para a sua área de transferência.
- Faz uma requisição de teste a um tile em `content-a.strava.com` (servidor do próprio Strava) para verificar se o link funciona.

## O que a extensão **não** faz

- Não envia nenhum dado para o desenvolvedor nem para terceiros. A única comunicação de rede é com os servidores do Strava.
- Não armazena dados: nada é salvo em disco ou sincronizado; tudo some quando o popup é fechado.
- Não usa analytics, rastreamento ou publicidade.
- Não vende nem transfere dados de usuários.

## Cuidado

A URL gerada contém os cookies da sua sessão do Strava e funciona como credencial enquanto eles forem válidos (cerca de 24 h). Não compartilhe esse link.

## Contato

Dúvidas ou problemas: abra uma issue em <https://github.com/erickdeoliveiraleal/strava-heatmap-josm/issues>.
