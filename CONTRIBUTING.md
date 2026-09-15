# Como contribuir

Alterações neste repositório afetam instalação e atualização de aplicativos.
Mantenha cada mudança pequena, rastreável e fácil de reverter.

## Fluxo obrigatório

1. Crie uma branch a partir de `main` atualizada.
2. Faça uma única mudança lógica por Pull Request.
3. Não envie commits diretamente para `main`.
4. Explique o produto afetado, o asset, a tag, o hash e os riscos.
5. Aguarde todos os checks e a revisão antes do merge.

Um PR deve alterar somente um produto, exceto quando o contrato exigir arquivos
relacionados, como `catalog.json`, `update_info.json` ou a assinatura do mesmo
produto.

## Commits

Use mensagens curtas e descritivas, preferencialmente com um destes prefixos:

- `release:` para metadados de uma publicação;
- `fix:` para correções;
- `security:` para hardening;
- `docs:` para documentação;
- `chore:` para manutenção sem mudança de produto.

Não inclua binários, secrets, credenciais, certificados privados, dumps ou
arquivos pessoais. Instaladores pertencem ao GitHub Releases.

## Validação

Execute antes de abrir o PR:

```powershell
node --test tests/*.test.mjs
node scripts/validate-manifests.mjs
node scripts/check-repository-safety.mjs
pwsh -NoProfile -File tests/install-security.tests.ps1
pwsh -NoProfile -File install.ps1 -ValidateOnly
```

O modo `-ValidateOnly` não instala nem executa o Just HUB.

Para uma publicação, siga também
[`docs/release-process.md`](docs/release-process.md). O SHA-256 deve vir do
asset baixado novamente pela URL pública final.
