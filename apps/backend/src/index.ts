import Fastify from 'fastify';
import cors from '@fastify/cors';

export const buildServer = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, { origin: true });

  app.get('/api/health', async () => ({ status: 'ok' }));

  return app;
};

if (require.main === module) {
  const app = buildServer();
  const port = Number(process.env.PORT) || 3001;
  app
    .listen({ port, host: '0.0.0.0' })
    .then(() => {
      console.log(`Backend running on http://localhost:${port}`);
    })
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
}