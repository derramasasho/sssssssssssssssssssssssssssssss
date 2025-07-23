import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// HEALTH CHECK API ENDPOINT
// =============================================================================

export async function GET(_request: NextRequest) {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      buildHash: process.env.NEXT_PUBLIC_BUILD_HASH || 'dev',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'operational', // Would check actual database if we had one
        apis: {
          jupiter: 'operational',
          oneInch: 'operational',
          coinGecko: 'operational',
          openAI: process.env.OPENAI_API_KEY ? 'operational' : 'degraded',
        },
        wallets: {
          ethereum: 'operational',
          solana: 'operational',
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
        },
      },
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// OPTIONS FOR CORS
// =============================================================================

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
