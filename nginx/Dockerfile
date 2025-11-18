# Usar la imagen oficial de Nginx basada en Alpine (más liviana)
FROM nginx:alpine

# Información del mantenedor
LABEL maintainer="Gym Microservices Team"
LABEL description="Nginx Load Balancer and Reverse Proxy for Gym Microservices"

# Copiar nuestra configuración personalizada de Nginx
# Esto reemplaza la configuración por defecto
COPY nginx.conf /etc/nginx/nginx.conf

# Crear directorios para logs si no existen
RUN mkdir -p /var/log/nginx

# Exponer el puerto 80 (puerto estándar HTTP)
EXPOSE 80

# Comando por defecto para iniciar Nginx
# -g "daemon off;" mantiene Nginx en primer plano para Docker
CMD ["nginx", "-g", "daemon off;"]