# Processo de publicação

Este processo mantém artefatos e manifestos verificáveis, sem escrever
diretamente na branch protegida `main`.

## Preparação

1. Atualize a versão no repositório de origem usando a fonte de verdade do
   produto.
2. Compile e execute todos os testes obrigatórios do produto.
3. Confirme o nome exato do artefato e a arquitetura Windows x64.
4. Crie uma tag versionada e uma release somente pelo fluxo oficial aprovado.
5. Publique o artefato final sem incluir arquivos intermediários.

Não substitua assets de releases existentes. Se o conteúdo mudar, publique uma
nova versão.

## Verificação do artefato

1. Baixe novamente o asset pela URL pública final.
2. Calcule o SHA-256 do arquivo baixado.
3. Compare nome, tamanho e hash com o resultado aprovado da compilação.
4. Interrompa a publicação dos metadados se qualquer valor divergir.

## Atualização dos metadados

1. Crie ou reutilize uma branch de release neste repositório.
2. Atualize apenas os manifestos relacionados ao produto.
3. Mantenha `catalog.json`, os manifestos de produto e endpoints legados
   consistentes.
4. Para o Just Private, assine
   `products/justprivate-update-manifest.json` e grave a assinatura em
   `products/justprivate-update-manifest.sig`.
5. Abra um Pull Request para `main` e aguarde todos os checks obrigatórios.
6. Faça merge somente após revisão e CI aprovada.

Nunca versione chaves privadas, tokens, certificados, logs sensíveis ou
binários. Falhas de API, Git, assinatura ou validação devem encerrar o fluxo com
erro; não podem ser convertidas em sucesso.

## Validação local

```powershell
node --test tests/*.test.mjs
node scripts/validate-manifests.mjs
node scripts/check-repository-safety.mjs
pwsh -NoProfile -File tests/install-security.tests.ps1
pwsh -NoProfile -File install.ps1 -ValidateOnly
```

Após o merge, consulte os arquivos pela URL raw, baixe novamente o asset e
repita a comparação do SHA-256. Preserve a branch até concluir essa validação.

## Apresentação pública

- Títulos de releases usam apenas o nome público do produto.
- Versões permanecem nas tags e nos manifestos, onde são consumidas de forma
  determinística.
- A descrição pública padrão é `Download Oficial para Windows`.
