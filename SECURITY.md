# Política de segurança

## Versão suportada

O canal `stable` atual de cada produto é o único coberto por correções de
segurança neste catálogo. Versões anteriores podem permanecer disponíveis para
auditoria, mas não são consideradas suportadas.

## Relato de vulnerabilidade

Não abra uma issue pública para vulnerabilidades, vazamento de credenciais ou
formas de contornar validações de atualização. Use o
[relato privado de vulnerabilidade do GitHub][private-report].

Inclua, quando possível:

- produto, arquivo, versão ou commit afetado;
- passos mínimos para reprodução;
- impacto observado ou potencial;
- evidências sem dados pessoais nem credenciais reais;
- sugestão de correção, se houver.

Não publique tokens, chaves privadas ou certificados na demonstração.

## Garantias do catálogo

As validações deste repositório exigem origem oficial, URLs versionadas, nomes
determinísticos, SHA-256 e consistência entre os manifestos. O manifesto de
atualização do Just Private também exige uma assinatura ECDSA P-256 válida.

Essas verificações reduzem riscos de adulteração e configuração incorreta, mas
não substituem a validação de segurança nos repositórios de origem.

[private-report]: https://github.com/loveawayss/JustReleases/security/advisories/new
