# Empleamos una imagen ligera de Node.js
FROM node:18-alpine

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de manifiesto de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos la carpeta de Prisma y el código fuente
COPY prisma ./prisma/
COPY . .

# Generamos el Cliente Prisma para que mapeé correctamente el cliente
RUN npx prisma generate

# Compilamos la aplicación de NestJS
RUN npm run build

# Exponemos el puerto del servidor
EXPOSE 3001

# Comando de arranque por defecto (en producción es start:prod o el puro dist/main)
CMD ["npm", "run", "start:prod"]
