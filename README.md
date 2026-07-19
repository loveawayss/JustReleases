# JustHubRelease

Repositório público de distribuição do JustHub.

## Finalidade

Este repositório hospeda o manifesto de atualização e os arquivos públicos necessários para distribuir versões do JustHub.

## Arquivos principais

- `update_info.json`: versão atual, notas, URL do instalador e hash SHA-256.
- `releases/`: arquivos de distribuição referenciados pelo manifesto.

## Fluxo de publicação

1. Validar o build do JustHub.
2. Gerar o instalador.
3. Calcular o SHA-256 do arquivo final.
4. Atualizar `update_info.json`.
5. Conferir se a URL e o hash correspondem exatamente ao arquivo publicado.
6. Publicar a versão somente após revisão.

## Verificação de integridade

O hash SHA-256 publicado em `update_info.json` deve corresponder ao instalador disponibilizado. Um hash incorreto pode fazer o atualizador rejeitar uma versão válida ou aceitar uma validação inconsistente.

## Regras

- Não incluir secrets, tokens, chaves privadas ou dados pessoais.
- Não publicar arquivos de teste ou builds sem identificação.
- Não alterar o manifesto sem atualizar também o arquivo correspondente.
- Preferir GitHub Releases para instaladores grandes, em vez de mantê-los diretamente no histórico Git.
- Manter nomes de versões e arquivos consistentes com o JustHub.

## Links

- Projeto principal: https://github.com/loveawayss/JustReleases
- Fonte privada/controle de release: https://github.com/loveawayss/JustReleases
