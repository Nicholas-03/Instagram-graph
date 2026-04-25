FROM node:20-bookworm-slim

ENV NODE_ENV=production
WORKDIR /spider

COPY package*.json ./
RUN npm ci --omit=dev

COPY . /spider

RUN ln -s /spider/scripts/start-crawl /usr/sbin/start-crawl \
    && ln -s /spider/scripts/shub-image-info /usr/sbin/shub-image-info \
    && chmod +x /spider/scripts/start-crawl /spider/scripts/shub-image-info

CMD ["/bin/bash"]
