# Fotos do template petshop

Os nomes são **por função**, não por conteúdo. Para trocar, substitua o
arquivo mantendo o nome; quem aponta caminho de foto (`IMAGEM`, `FOTO`) é o
JSON do cliente.

> **As fotos que estão aqui são de DEMONSTRAÇÃO.** As de serviço, galeria,
> sobre e equipe vieram do projeto Amigo Fiel (banco de imagens Pexels, uso
> comercial livre). Os bichos do hero e as artes do osso são de banco também.
> Todo site gerado precisa trocar as fotos do cliente.

| Arquivo | Onde aparece | Proporção | Dimensão (px) | Peso máx. |
|---|---|---|---|---|
| `hero-pets.webp` | Hero: bichos inteiros, corpo estendido até uma linha reta (fica atrás da seção seguinte). Transparente. | ~16:10 | 1600 × 1000 | 250 KB |
| `hero-pets-patas.webp` | Hero: só as patas, mesmo enquadramento do anterior (fica na frente da seção seguinte). Transparente. | ~16:10 | 1600 × 1000 | 60 KB |
| `nav-osso.webp` | Cabeçalho no desktop: osso com os cachorros, transparente. Trocou, remeça a placa no CSS. | 6:1 | 3000 × 500 | 120 KB |
| `nav-osso-celular.webp` | Cabeçalho no celular, transparente. | 5:1 | 2000 × 400 | 60 KB |
| `sobre.jpg` | Seção "Sobre", moldura branca | ~1:1 | 900 × 950 | 200 KB |
| `servico-1.jpg` … `servico-5.jpg` | Carrossel "O que a gente oferece" (uma por serviço) | 5:4 | 1000 × 800 | 120 KB cada |
| `profissional-1.jpg`, `profissional-2.jpg` | Cards da equipe (retrato) | 4:5 | 800 × 1000 | 150 KB cada |
| `galeria-1.jpg` … `galeria-3.jpg` | Esteira de fotos: moldura 3:4 no desktop e 4:5 no celular. Mande em pé. | 3:4 | 900 × 1200 | 200 KB cada |
| `capa.jpg` | Preview do link no WhatsApp/Instagram (`og:image`) | ~2:1 | 1600 × 825 | 250 KB |

## Regras práticas

- JPG qualidade 80 já resolve para fotos; WebP para tudo que tem
  transparência. Foto acima do limite da tabela deixa o site lento no 4G.
- Pode ter mais fotos (`servico-6.jpg`, `galeria-4.jpg`...): basta apontar no
  JSON. Pode ter menos também.
- Os bichos do hero de exemplo têm 1000 × 933 px, abaixo do recomendado; ver a
  receita em `../../README.md` para preparar a arte do cliente.
- Neste site o nome em texto do template foi trocado pelo logo em imagem:
  `logo.png` (500 × 500, fundo transparente, 45 KB, gerado do
  `patinhas_e_estilo_logo.png` original em `../../../assets/`). Aparece no
  cabeçalho, no rodapé e como favicon. Se o Alan mandar logo novo, exportar
  quadrado, PNG transparente, até 80 KB, mantendo o nome.
