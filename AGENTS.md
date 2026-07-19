# Regras de trabalho do JustHubRelease

## Escopo
Este repositório público distribui versões do JustHub e seus manifestos de atualização.

## Fluxo
- Trabalhe em uma branch, nunca diretamente na main.
- Atualize manifesto, instalador e hash como uma única mudança revisável.
- Valide JSON e SHA-256 antes de abrir um Pull Request.
- Não publique releases sem aprovação explícita.

## Segurança
- Nunca commite secrets, tokens, chaves privadas ou dados pessoais.
- Não publique builds de teste sem identificação.
- Não altere URLs de atualização sem verificar o impacto no JustHub.
- Prefira GitHub Releases para instaladores grandes e preserve a integridade do arquivo.

## IA
- Leia este arquivo e o README antes de alterar.
- Não substitua versões, hashes ou URLs sem confirmar a origem.
- Mostre arquivos alterados, hash validado e riscos ao finalizar.
