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
| `galeria-1.jpg` … `galeria-8.jpg` | Esteira contínua de fotos, moldura 3:4. Mande em pé. Pode ter mais ou menos fotos: o script duplica o que estiver no HTML. | 3:4 | 900 × 1200 | 200 KB cada |
| `fachada.webp` | Faixa "Nossa loja" (antes do mapa), desktop. Foto real da fachada, inteira, sem texto por cima. | 2,4:1 | 1920 × 800 | 120 KB |
| `fachada-celular.webp` | A mesma faixa no celular, recorte em pé centrado na porta. | 4:5 | 720 × 900 | 60 KB |
| `../videos/banho.mp4` | Seção "Sobre", dentro do recorte, no lugar de `sobre.jpg` (que virou o poster). Mudo, em loop, só carrega quando a seção aparece. | 16:9 | 960 × 540 | 2 MB (a única exceção de peso do site) |
| `capa.jpg` | Preview do link no WhatsApp/Instagram (`og:image`). Neste site é a logo centralizada sobre creme, não uma foto. | ~2:1 | 1600 × 825 | 250 KB |

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

## Vídeo e fundos (18/09/2026)

- `../videos/banho.mp4` é de banco (Pexels 6131723, Tima Miroshnichenko, licença
  livre). `preload="none"`: o `script.js` só põe o `src` quando a seção chega a
  240px da tela, e não põe com `prefers-reduced-motion` nem com economia de dados.
  Nesses casos fica `sobre.jpg` como poster. Trocar por um vídeo curto do Alan
  dando banho, em paisagem, até 15 s e uns 2 MB em 960x540.
- A seção de depoimentos usa `servico-3.jpg` como fundo, lavada com creme a 82%.
  Se trocar a foto de serviço, o fundo muda junto: conferir que continua clara.
- A fachada aparece só na faixa "Nossa loja"; como fundo do hero foi testada e
  descartada (ver `historico.md`, 18/09).
