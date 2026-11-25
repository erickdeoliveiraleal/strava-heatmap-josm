# Textos para a Chrome Web Store

Campos a preencher no [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Store listing

**Categoria:** Ferramentas para desenvolvedores (Developer Tools)
**Idioma:** Português (Brasil)

**Descrição:**

> Gera, com um clique, a URL TMS do Strava Global Heatmap pronta para colar no JOSM (ou iD), para mapear trilhas e caminhos no OpenStreetMap.
>
> Como usar:
> 1. Abra https://www.strava.com/maps/global-heatmap logado e dê zoom no mapa.
> 2. Clique no ícone da extensão, escolha atividade e cor.
> 3. Clique em "Copiar para JOSM" e cole em Preferências → Imagens → + TMS.
>
> A extensão lê os cookies da sua sessão no Strava (que páginas e userscripts não conseguem ler) e os coloca no header da URL TMS. Ela também testa um tile para confirmar que o link funciona e, se o Strava mudar os cookies exigidos, descobre o novo conjunto sozinha.
>
> Nenhum dado sai do seu navegador, exceto as requisições aos próprios servidores do Strava. Os cookies expiram em cerca de 24 h; depois é só gerar de novo.
>
> Projeto independente, sem vínculo com o Strava. Código-fonte: https://github.com/erickdeoliveiraleal/strava-heatmap-josm

**Imagens:**
- Ícone 128×128: `icons/icon-128.png`
- Bloco promocional pequeno 440×280: `store/promo-440x280.png`
- Capturas de tela (1280×800 ou 640×400, pelo menos 1): tire uma do popup aberto sobre o heatmap.

## Privacy practices

**Finalidade única (single purpose):**
> Gerar a URL TMS do Strava Global Heatmap, com os cookies de sessão necessários, para uso em editores do OpenStreetMap (JOSM/iD).

**Justificativa das permissões:**

| Permissão | Justificativa |
|---|---|
| `cookies` | Ler os cookies de sessão do strava.com (assinatura CloudFront e `_strava_idcf`), que são HttpOnly, para incluí-los no header da URL TMS usada pelo JOSM. |
| `declarativeNetRequestWithHostAccess` | Durante o teste do link, definir temporariamente o header `Cookie` de uma única requisição de tile ao strava.com, simulando exatamente como o JOSM fará a requisição. A regra é removida logo em seguida. |
| Host `https://*.strava.com/*` | Necessário para ler os cookies do Strava, fazer a requisição de teste ao servidor de tiles e ler a atividade/cor da aba do heatmap. |

**Código remoto:** Não, não uso código remoto.

**Uso de dados:** marcar **"Informações de autenticação"** (cookies de sessão).
Marcar as três declarações:
- Não vendo nem transfiro dados de usuários a terceiros, fora dos casos de uso aprovados.
- Não uso nem transfiro dados de usuários para finalidades não relacionadas à finalidade única do item.
- Não uso nem transfiro dados de usuários para determinar capacidade de crédito ou para empréstimos.

**URL da política de privacidade:**
https://github.com/erickdeoliveiraleal/strava-heatmap-josm/blob/main/PRIVACY.md

## Distribution

- Visibilidade: Público (ou "Não listado", se quiser só compartilhar o link).
- Regiões: todas.
