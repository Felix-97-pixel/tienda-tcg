# Empleamos una imagen ligera
FROM node:18-alpine

# Definimos el directorio de trabajo
WORKDIR /app

# Copiamos los paquetes de instalación
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código de Next.js
COPY . .

# Compilamos Next.js
RUN npm run build

# Exponemos el puerto de React
EXPOSE 3000

# Iniciamos el entorno nativo en producción
CMD ["npm", "run", "start"]
