# JustHubLinks

Repositório público para hospedar links e arquivos customizados usados pelo JustHub.

## Uso correto

Use este repositório principalmente com **GitHub Releases**.

Não coloque instaladores grandes direto no código do repositório. Para `.exe`, `.msi`, `.zip` ou `.rar`, use a aba **Releases**.

## Como subir um arquivo customizado

1. Abra a aba **Releases**.
2. Clique em **Draft a new release**.
3. Use uma tag simples, exemplo:
   - `hailstorm-v1`
   - `attack-shark-x3-v1`
   - `delux-m600pro-v1`
4. Faça upload do arquivo.
5. Publique a release.
6. O link final fica neste formato:

```txt
https://github.com/loveawayss/JustReleases/releases/download/TAG/NOME_DO_ARQUIVO
```

Exemplo:

```txt
https://github.com/loveawayss/JustReleases/releases/download/hailstorm-v1/Hailstorm.zip
```

## Uso no JustHub

No `src/privateProfiles.js`, use o link da release como `downloadUrl`:

```js
{
  label: "Hailstorm",
  downloadType: "direct",
  downloadUrl: "https://github.com/loveawayss/JustReleases/releases/download/hailstorm-v1/Hailstorm.zip",
  fileName: "Hailstorm.zip"
}
```

## Regra

- Apps oficiais continuam usando links oficiais/resolvedores.
- Este repositório deve ser usado só para arquivos customizados ou arquivos que não têm link direto confiável.
- Não colocar nada privado, sensível ou pago aqui, porque o repositório é público.
