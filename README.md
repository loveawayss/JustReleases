# Just Releases

[![Validação do catálogo][ci-badge]][ci-workflow]

Canal oficial de distribuição dos aplicativos Just para Windows x64.

Este repositório mantém somente metadados auditáveis: catálogo, manifestos,
hashes e políticas de atualização. Instaladores e pacotes são publicados em
[releases versionadas][releases]; binários não são armazenados no Git.

## Produtos

| Produto          | Canal    | Manifesto                     |
| ---------------- | -------- | ----------------------------- |
| Just HUB         | `stable` | [`justhub.json`][hub]         |
| Just Cleaner     | `stable` | [`justcleaner.json`][cleaner] |
| Just Private     | `stable` | [`justprivate.json`][private] |
| Just Free Tweaks | `stable` | [`justfree.json`][free]       |

Todos os downloads oficiais são destinados ao Windows x64 e hospedados
exclusivamente em `loveawayss/JustReleases`.

## Uso

O índice público está disponível em:

```text
https://raw.githubusercontent.com/loveawayss/JustReleases/main/catalog.json
```

Consumidores devem aceitar somente schemas conhecidos, validar estritamente a
identidade do produto, a origem da URL, o nome do asset e o SHA-256 antes de
executar qualquer arquivo.

Para validar uma cópia local do repositório:

```powershell
node --test tests/*.test.mjs
node scripts/validate-manifests.mjs
node scripts/check-repository-safety.mjs
pwsh -NoProfile -File tests/install-security.tests.ps1
pwsh -NoProfile -File install.ps1 -ValidateOnly
```

O último comando valida o fluxo público do Just HUB sem instalar ou
executar o aplicativo.

## Estrutura

- [`catalog.json`](catalog.json): índice oficial de produtos e canais.
- [`products/`](products): manifestos de produto e atualização.
- [`update_info.json`](update_info.json): endpoint legado do Just HUB.
- [`install.ps1`](install.ps1): instalador controlado do Just HUB.
- [`scripts/`](scripts): validadores usados localmente e na CI.
- [`tests/`](tests): testes de contrato e segurança.

O contrato dos arquivos está documentado em
[`docs/distribution-contract.md`](docs/distribution-contract.md). O processo de
publicação está em [`docs/release-process.md`](docs/release-process.md).

## Segurança e contribuições

O Just Private protege seu manifesto de atualização com assinatura ECDSA
P-256 destacada. Todos os produtos usam URLs determinísticas e hashes SHA-256.
A CI rejeita inconsistências, origens inesperadas, referências privadas e
padrões conhecidos de segredos.

Consulte [`SECURITY.md`](SECURITY.md) para relatar uma vulnerabilidade de forma
privada e [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de propor alterações.

> **Download Oficial para Windows**

[ci-badge]: https://github.com/loveawayss/JustReleases/actions/workflows/ci.yml/badge.svg
[ci-workflow]: https://github.com/loveawayss/JustReleases/actions/workflows/ci.yml
[cleaner]: products/justcleaner.json
[free]: products/justfree.json
[hub]: products/justhub.json
[private]: products/justprivate.json
[releases]: https://github.com/loveawayss/JustReleases/releases
