import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MyContext {
  prisma: PrismaClient;
}

import { GraphQLError } from 'graphql';
import { Request } from 'express';

export const createContext = async ({ req }: { req: Request }): Promise<MyContext> => {
  const apiKeyHeader = (req.headers['x-api-key'] || req.headers['api-key']) as string | undefined;
  const authHeader = req.headers.authorization as string | undefined;
  const validKey = process.env.API_KEY || 'HealthFirst_SecretKey_2026!@#';

  // Allow Apollo Studio/Sandbox to introspect the schema without an API key
  if (req.body && req.body.operationName === 'IntrospectionQuery') {
    return { prisma };
  }

  // Validate API Key from either x-api-key or authorization header
  const isAuthorized =
    apiKeyHeader === validKey ||
    authHeader === validKey ||
    authHeader === `Bearer ${validKey}` ||
    (apiKeyHeader === validKey && !!authHeader);

  if (!isAuthorized) {
    throw new GraphQLError('You are not authorized to access this API. Invalid or missing API Key.', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  return {
    prisma,
  };
};
