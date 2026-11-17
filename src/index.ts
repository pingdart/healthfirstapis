import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { createContext } from './context';

import path from 'path';
import fs from 'fs';

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // Configurable CORS for production security
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : '*';
  app.use(cors({ origin: allowedOrigins }));

  // Serve uploads folder statically robustly
  let baseDir = __dirname;
  if (baseDir.endsWith('src') || baseDir.endsWith(`${path.sep}src`)) {
    baseDir = path.join(baseDir, '..');
  }
  if (baseDir.endsWith('dist') || baseDir.endsWith(`${path.sep}dist`)) {
    baseDir = path.join(baseDir, '..');
  }
  const uploadsDir = path.join(baseDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  app.use('/api/uploads', express.static(uploadsDir));

  // Debug route - restricted to authenticated requests or dev environment
  app.get('/api/debug-uploads', (req, res) => {
    const authHeader = req.headers.authorization || req.headers['x-api-key'];
    const validKey = process.env.API_KEY;
    if (process.env.NODE_ENV === 'production' && (!authHeader || authHeader !== validKey)) {
      return res.status(404).send('Not Found');
    }
    try {
      const exists = fs.existsSync(uploadsDir);
      res.json({
        exists,
        fileCount: exists ? fs.readdirSync(uploadsDir).length : 0
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Strict MIME type whitelist and corresponding safe extensions
  const ALLOWED_MIME_TYPES: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };

  // Secure file upload endpoint with MIME verification and size limit
  app.post('/upload', express.json({ limit: '10mb' }), (req, res) => {
    try {
      const { image, type } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      // Extract and validate base64 content
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 image format' });
      }

      const mimeType = matches[1].toLowerCase();
      const extension = ALLOWED_MIME_TYPES[mimeType];
      if (!extension) {
        return res.status(400).json({
          error: 'Unsupported file type. Only JPEG, PNG, WebP, and GIF images are permitted.'
        });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      // Enforce 8MB max decoded size
      if (buffer.length > 8 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds 8MB limit' });
      }

      const folder = type === 'gallery' ? path.join(uploadsDir, 'gallery') : uploadsDir;
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      const safePrefix = ['gallery', 'blog', 'logo', 'hero'].includes(type) ? type : 'upload';
      const randomToken = Math.random().toString(36).substring(2, 8);
      const filename = `${safePrefix}-${Date.now()}-${randomToken}${extension}`;
      const filepath = path.join(folder, filename);

      fs.writeFileSync(filepath, buffer);

      const pathSuffix = type === 'gallery' ? 'uploads/gallery' : 'uploads';
      const fileUrl = process.env.API_BASE_URL
        ? `${process.env.API_BASE_URL.replace(/\/$/, '')}/${pathSuffix}/${filename}`
        : `/${pathSuffix}/${filename}`;

      return res.json({ url: fileUrl });
    } catch (err: any) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  // Start the server on the specified port
  const PORT = process.env.PORT || 4000;

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startApolloServer().catch((err) => {
  console.error(err);
});
