# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
# Remove --frozen-lockfile flag to allow lockfile updates
RUN cd /temp/dev && bun install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
# Remove --frozen-lockfile flag to allow lockfile updates
RUN cd /temp/prod && bun install --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# build the app
ENV NODE_ENV=production
ENV DATABASE_URL='postgresql://neondb_owner:npg_AQ4bchwyUF7n@ep-shy-union-a291qvfj.eu-central-1.aws.neon.tech/neondb?sslmode=require'
ENV CORS_ORIGIN=http://localhost:3001
ENV BETTER_AUTH_SECRET=skjqUTlcFnqiv7ytqOf7J8hnoelRksHu
ENV BETTER_AUTH_URL=http://localhost:3000
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist ./dist
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start" ] 