# Contrato de distribuição

Este documento descreve as fronteiras de confiança e a relação entre os
metadados públicos do Just Releases.

## Catálogo e manifestos

- `catalog.json` é o índice dos produtos, canais e manifestos disponíveis.
- `products/justhub.json` descreve o instalador estável do Just HUB.
- `products/justcleaner.json` descreve o instalador estável do Just Cleaner.
- `products/justfree.json` descreve o pacote estável do Just Free Tweaks.
- `products/justprivate.json` descreve o instalador e o pacote de atualização
  estáveis do Just Private.
- `products/justprivate-update-manifest.json` define a política e o pacote de
  atualização binária do Just Private.
- `products/justprivate-update-manifest.sig` contém a assinatura destacada do
  manifesto de atualização do Just Private.
- `update_info.json` preserva o contrato legado de atualização do Just HUB.

O campo `updatedAt` de `catalog.json` registra a publicação mais recente
representada pelo catálogo. Toda alteração de versão estável deve atualizá-lo.

## Regras para consumidores

Manifestos remotos são entrada não confiável. Um consumidor deve:

1. aceitar apenas versões de schema conhecidas;
2. usar uma lista fixa de produtos, canais, plataformas e arquiteturas;
3. exigir versão SemVer válida;
4. aceitar somente HTTPS e a origem oficial esperada;
5. validar a tag, o caminho e o nome exato do asset;
6. rejeitar comandos, argumentos e caminhos locais fornecidos pela rede;
7. calcular o SHA-256 do arquivo baixado antes de qualquer execução;
8. interromper o fluxo e descartar o arquivo se houver divergência.

Uma conclusão de download não comprova instalação nem atualização. O cliente
deve consultar novamente o estado real do aplicativo no sistema operacional.

## Modelo de confiança

O fluxo separa três responsabilidades:

1. o repositório do produto compila e testa o código;
2. uma release versionada hospeda o artefato imutável;
3. este repositório publica metadados revisáveis por Pull Request.

O hash declarado deve ser calculado a partir do asset público final. Assets já
publicados não podem ser substituídos silenciosamente.

O Just Private adiciona assinatura ECDSA P-256 ao manifesto de atualização. A
assinatura, a chave permitida, o canal e o vínculo de versão devem ser validados
antes de aceitar o pacote.

## Verificação manual

```powershell
$expected = "SHA256_DECLARADO_NO_MANIFESTO"
$actual = (
    Get-FileHash -LiteralPath ".\arquivo.exe" -Algorithm SHA256
).Hash.ToLowerInvariant()

if ($actual -ne $expected) {
    throw "Falha de integridade: o arquivo não deve ser executado."
}
```

Uma divergência é uma falha definitiva para aquele arquivo baixado.
