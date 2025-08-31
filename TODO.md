Boa! O template rocketseat-advanced já vem com muita coisa pronta (TypeScript, Eslint/Prettier, Husky, commitlint, absolute imports, styled-components, react-navigation, react-query, axios, etc).
Ou seja: muitos pontos que eu tinha colocado nos prompts como setup manual agora já estão no boilerplate.
O foco passa a ser migração Angular → RN adaptando para a estrutura desse template.

⸻

📂 Estrutura base do template (resumida)

src/
  @types/
  components/
  hooks/
  routes/
  screens/
  services/
  store/
  styles/
  utils/


⸻

🔑 Atualização dos Prompts

1. Bootstrap do projeto RN (já incluso no template)

Prompt atualizado para o Codex:

Você é um agente de migração Angular → React Native.
Objetivo: portar meu app Angular para o template fiap-bytebank-react-native.

Tarefas:
1) Ajustar App.tsx para envolver com QueryClientProvider (já vem react-query).
2) Criar src/routes/AppRoutes.tsx com stack e tabs.
3) Criar src/store/app.store.ts com Zustand (tema, auth).
4) Criar src/services/api.ts configurando axios (já existe, ajustar baseURL e interceptors).
5) Criar src/services/queries/user.ts com queries React Query de exemplo.
6) Criar src/screens/Home e src/screens/Settings consumindo esses queries.
7) Usar styled-components para estilizar (já incluso no template).
8) Configurar i18next em src/services/i18n/index.ts.

Critérios:
- Rodar com `npm run android/ios` sem erros.
- Navegar entre Home e Settings.
- Query de usuário mock retornando no Home.


⸻

2. Service Angular → Query Hook

Converta este Angular service (HttpClient + Observable) para React Query + Axios, no padrão do template rocketseat-advanced:
- Criar em src/services/queries/<entity>.ts
- Cada método vira um hook React Query (ex.: useFetchUsers, useCreateUser).
- Usar api (src/services/api.ts) como cliente Axios.
- Interfaces em src/@types/<entity>.d.ts
- Validação opcional com Zod em src/utils/schemas/<entity>.ts


⸻

3. Component Angular → Screen RN

Converta este Angular component (TS, HTML, SCSS) em um screen React Native (styled-components):
- Criar em src/screens/<Name>Screen/index.tsx
- Criar styles.ts com styled-components
- Form Angular → React Hook Form (useForm) + Zod
- Eventos (click/input) → handlers React
- Navegação via React Navigation (useNavigation)
- Estado global via Zustand quando necessário


⸻

4. Guards e Interceptors

Migre Guards e Interceptors Angular para o template RN:
- Guards → lógica em src/routes/AppRoutes.tsx (checar Zustand auth antes de navegar)
- Interceptors → configurar em src/services/api.ts (axios interceptors para token e refresh)


⸻

5. Forms

Converta Reactive Forms Angular em React Hook Form + Zod:
- Schema em src/utils/schemas/<form>.ts
- Hook useForm no componente
- Inputs estilizados com styled-components


⸻

6. i18n

Migrar Angular i18n para i18next:
- Criar src/services/i18n/index.ts com config
- Criar src/services/i18n/locales/{pt,en}.json
- Substituir pipes Angular ({{ 'KEY' | translate }}) por hook useTranslation


⸻

✅ Prompt Macro Final

Contexto: migrar app Angular para React Native usando o template react-native-template-rocketseat-advanced.

Aja como Arquiteto Sênior.
Leia os arquivos Angular em /contents/angular-project e para layout lei o figma em contents/figma/bytebank-figma e crie no projeto RN react native:

- Services Angular → src/services/queries/* (React Query + Axios).
- Firebase -> Vamos adicionar a camada de firebase para conter as funcioinalidades de CRUD ao inves de utlizar a API
- Login com Firebase -> Vamos utlizar o login do firebase utlizando multiplos providfers como Google, Email, Apple e email + senha
- Components/Pages Angular → src/screens/* (styled-components).
- Forms → RHF + Zod (src/utils/schemas).
- Router/Guards → src/routes/AppRoutes.tsx + Zustand auth store.
- i18n → src/services/i18n.

Critérios:
1) Siga clean code, SOLID e as melhores praticas de desenvolvimento mobile seguind MVVM
2)  Migre o projeto atual para typescript
3)  Garanta o funcionamento basico e completo, como build e start do projeto, ele deve estar compilando e funcional
4) App roda com `npm start` e `npm run android/ios`.
5) Navegação stack/tabs funcionando.
6) Um CRUD básico migrado.
7) Código organizado conforme estrutura do template.
8) atualizar o meu package com os novos scripts para executar o projeto no ios e android
9)  Adicione as implementacoes reais utlizando o firebase


Faça o seu melhor a qualquer custo!
