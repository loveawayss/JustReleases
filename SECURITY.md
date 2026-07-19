# Segurança

Este repositório contém o código e a documentação relacionados ao distribuição pública do JustHub.

## Não publique

- senhas, tokens, chaves privadas ou arquivos `.env`;
- credenciais de Discord, Mercado Pago, Supabase ou bancos de dados;
- dados pessoais de usuários;
- payloads, builds ou artefatos privados sem aprovação.

## Como reportar um problema

Não abra uma Issue pública para uma vulnerabilidade. Envie uma mensagem privada ao proprietário do repositório pelo GitHub, descrevendo:

- impacto;
- passos para reproduzir;
- versão ou commit afetado;
- evidências sem incluir secrets.

Não inclua credenciais reais no relatório. Se uma credencial tiver sido exposta, revogue-a e substitua-a imediatamente.

## Regra para ferramentas de IA

Codex, Claude Code e outras ferramentas devem:

- não ler ou imprimir secrets;
- não commitar arquivos ignorados;
- não publicar releases ou fazer deploy sem aprovação explícita;
- informar qualquer suspeita de vazamento antes de continuar.
