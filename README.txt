CMJ (Web) — PWA instalável no Chrome
------------------------------------
Como publicar sem servidor:
1) Acesse **Netlify** (netlify.com) → Add new site → Deploy manually → arraste a pasta inteira deste ZIP.
   Ou **Vercel** → New Project → arraste a pasta.
   Ou **GitHub Pages** → suba os arquivos e ative Pages.
2) Abra a URL no **Chrome Android** e instale (menu → "Instalar app").

Rodar local para testes:
- Precisará servir via HTTP (por ex.):
  python -m http.server 5500  # depois abra http://localhost:5500

Funções:
- 12 maquininhas; Entrada (verde) / Saída (vermelho);
- Resumo por dia e limpar por data;
- Salva no localStorage (offline);
- Formatação BRL (R$).