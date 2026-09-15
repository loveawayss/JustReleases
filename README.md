# Just Releases

**Canal oficial de distribuição para os aplicativos Just no Windows.**

[Downloads oficiais](/loveawayss/JustReleases/releases) ·
[Catálogo](catalog.json) ·
[Manifestos](products)

---

## Visão geral

Este repositório centraliza o catálogo público, os manifestos de versão e os
hashes de integridade dos produtos Just.

O Git armazena somente metadados auditáveis. Instaladores e pacotes de
atualização são distribuídos por releases versionadas.

### Just HUB

- Canal: `stable`
- Manifesto: [`products/justhub.json`](products/justhub.json)
- Distribuição: [GitHub Releases](/loveawayss/JustReleases/releases)

### Just Cleaner

- Canal: `stable`
- Manifesto: [`products/justcleaner.json`](products/justcleaner.json)
- Distribuição: [GitHub Releases](/loveawayss/JustReleases/releases)

### Just Private

- Canal: `stable`
- Manifesto: [`products/justprivate.json`](products/justprivate.json)
- Distribuição: [GitHub Releases](/loveawayss/JustReleases/releases)

> Todos os artefatos oficiais deste catálogo são destinados ao Windows x64 e
> publicados exclusivamente em `loveawayss/JustReleases`.

## Contrato de distribuição

- [`catalog.json`](catalog.json)
  é o índice oficial dos produtos, canais e manifestos disponíveis.
- [`products/justhub.json`](products/justhub.json)
  descreve o artefato estável do Just HUB.
- [`products/justcleaner.json`](products/justcleaner.json)
  descreve o artefato estável do Just Cleaner.
- [`products/justprivate.json`](products/justprivate.json)
  descreve os artefatos estáveis do Just Private.
- [`products/justprivate-update-manifest.json`](products/justprivate-update-manifest.json)
  define a política e o pacote de atualização binária do Just Private.
- [`products/justprivate-update-manifest.json.sig`](products/justprivate-update-manifest.json.sig)
  contém a assinatura destacada desse manifesto.
- [`update_info.json`](update_info.json)
  mantém o endpoint legado de atualização do Just HUB.
- [`install.ps1`](install.ps1)
  fornece instalação controlada via linha de comando.

Os consumidores devem tratar todo manifesto remoto como entrada não confiável.
Antes de executar qualquer arquivo, devem validar:

- schema e identidade do produto;
- canal, plataforma e arquitetura;
- origem da URL e nome esperado do asset;
- SHA-256 do conteúdo baixado.

## Modelo de confiança

O fluxo de publicação separa código, binários e metadados:

1. O produto é compilado e testado em seu repositório de origem.
2. O artefato final é publicado em uma release com tag versionada.
3. O SHA-256 é calculado a partir do arquivo efetivamente publicado.
4. Os manifestos são atualizados por Pull Request.
5. A validação obrigatória precisa passar antes do merge.
6. O cliente recalcula o hash antes de permitir qualquer execução.

O Just Private adiciona uma segunda camada: seu manifesto de atualização possui
assinatura ECDSA P-256 destacada. A aplicação verifica a assinatura, a chave e
o vínculo com a versão antes de aceitar o pacote.

A CI deste repositório valida a estrutura e a consistência dos metadados. A
verificação criptográfica completa pertence ao cliente confiável.

## Verificação de integridade

Compare o arquivo baixado com o valor `sha256` declarado no manifesto:

```powershell
$expected = "SHA256_DECLARADO_NO_MANIFESTO"
$actual = (
    Get-FileHash -LiteralPath ".\arquivo.exe" -Algorithm SHA256
).Hash.ToLowerInvariant()

if ($actual -ne $expected) {
    throw "Falha de integridade: o arquivo não deve ser executado."
}
```

Uma divergência deve ser tratada como falha definitiva. Descarte o arquivo e
não tente executá-lo.

## Política de mudanças

- Manifestos devem ser alterados por Pull Request.
- Assets existentes não devem ser substituídos silenciosamente.
- URLs devem apontar para tags e nomes de arquivo determinísticos.
- Hashes devem representar o asset público final.
- Binários não pertencem ao histórico Git.
- Segredos, credenciais e certificados privados nunca devem ser versionados.
- Falhas de validação não devem ser ignoradas ou convertidas em sucesso.

## Validação contínua

O workflow [`ci.yml`](.github/workflows/ci.yml) verifica:

- sintaxe e estrutura dos documentos JSON;
- consistência entre catálogo, produtos e artefatos;
- origem permitida das URLs de download;
- formato dos hashes SHA-256;
- formato dos metadados de assinatura do Just Private;
- padrões conhecidos de segredos e referências privadas.

## Consumo automatizado

O catálogo pode ser consultado diretamente pela URL raw:

```text
https://raw.githubusercontent.com/loveawayss/JustReleases/main/catalog.json
```

Para automações, fixe o produto pelo `id`, aceite somente schemas conhecidos e
faça validação estrita antes de seguir qualquer URL fornecida pelo catálogo.

---

> **Download Oficial para Windows**
