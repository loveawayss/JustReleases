# Just Releases

Fonte publica de distribuicao e metadados dos projetos da Just.

Este repositorio centraliza catalogos, manifestos de atualizacao e links verificaveis para os projetos da Just. Nao inclua segredos, dados pessoais ou builds de teste.

## Arquivos principais

- `catalog.json`: indice dos produtos e canais publicados.
- `products/`: manifesto especifico de cada produto.
- `update_info.json`: manifesto compativel usado pelo atualizador atual do JustHub.
- `releases/`: copia legada do instalador mantida durante a transicao.
- GitHub Releases: local recomendado para os instaladores distribuidos.

## Fluxo de publicacao

1. Validar o build do produto.
2. Gerar o instalador e calcular o SHA-256 do arquivo final.
3. Criar uma GitHub Release com o instalador como asset.
4. Atualizar o manifesto do produto, `catalog.json` e, quando aplicavel, `update_info.json`.
5. Conferir se a URL direta e o hash correspondem exatamente ao asset publicado.
6. Publicar somente apos revisao.

## Links diretos

Para baixar um asset sem abrir a pagina da Release, use:

`https://github.com/loveawayss/JustReleases/releases/latest/download/<nome-do-arquivo>`

Links `raw.githubusercontent.com` devem ser reservados para manifestos pequenos. Instaladores devem ficar em GitHub Releases.

## Verificacao de integridade

O SHA-256 publicado nos manifestos deve corresponder exatamente ao asset distribuido. Hash sozinho comprova integridade do arquivo, mas nao substitui assinatura digital para autenticar a origem.

## Regras

- Nao incluir secrets, tokens, chaves privadas ou dados pessoais.
- Nao publicar arquivos de teste ou builds sem identificacao.
- Nao alterar manifesto sem atualizar o arquivo correspondente.
- Manter nomes de versoes e arquivos consistentes com cada produto.

## Links

- Projeto principal: https://github.com/loveawayss/JustReleases
- Fonte privada/controle de release: https://github.com/loveawayss/JustReleases
- Download publico do JustPrivate: https://github.com/loveawayss/JustReleases/releases/latest
