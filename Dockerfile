# ---------- Builder ----------
# Use LTS atual (Node 22). Pode trocar para 20 se precisar.
FROM node:22-alpine AS builder

# Instale apenas o necessário para builds com dependências nativas.
# Se seu projeto não precisa, pode remover python3/make/g++.
RUN apk add --no-cache python3 make g++

# Diretório de trabalho
WORKDIR /app

# Copia apenas manifests para aproveitar cache
COPY package*.json ./

# Instala dependências (dev incluídas, pois é build)
RUN npm ci

# Copia o restante do código
COPY . .

# Build de produção
RUN npm run build


# ---------- Runtime (Nginx) ----------
FROM nginx:1.27-alpine

# Opcional: curl para healthcheck
RUN apk add --no-cache curl

# Limpa config default e adiciona a nossa
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Defina o diretório de saída em tempo de build:
# - Para Vite/React (static): BUILD_DIR=dist
# - Para Angular CSR: BUILD_DIR=dist/<nome-app>/browser
ARG BUILD_DIR=dist

# Copia os artefatos buildados para o Nginx
# (usa --chown para garantir permissões)
COPY --from=builder --chown=nginx:nginx /app/${BUILD_DIR} /usr/share/nginx/html

# Porta HTTP
EXPOSE 80

# Healthcheck simples (verifica se responde 200)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost/ || exit 1

# Sobe o Nginx no foreground
CMD ["nginx", "-g", "daemon off;"]
