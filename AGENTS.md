# Regras de trabalho do Just Releases

## Escopo

Este repositorio publico distribui versoes e manifestos dos projetos da Just.

## Fluxo

- Trabalhe em uma branch, nunca diretamente na main.
- Atualize manifesto, instalador e hash como uma unica mudanca revisavel.
- Valide JSON e SHA-256 antes de abrir um Pull Request.
- Nao publique releases sem aprovacao explicita.

## Seguranca

- Nunca commite secrets, tokens, chaves privadas ou dados pessoais.
- Nao publique builds de teste sem identificacao.
- Nao altere URLs de atualizacao sem verificar o impacto nos consumidores.
- Prefira GitHub Releases para instaladores grandes e preserve a integridade do arquivo.
- Hash valida integridade; para autenticidade, planeje assinatura digital do instalador.

## IA

- Leia este arquivo e o README antes de alterar.
- Nao substitua versoes, hashes ou URLs sem confirmar a origem.
- Mostre arquivos alterados, hash validado e riscos ao finalizar.
