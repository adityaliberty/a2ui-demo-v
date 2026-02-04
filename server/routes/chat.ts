import { Router, Request, Response } from 'express';
import { geminiAgent } from '../agents/geminiAgent.js';
import { nanoid } from 'nanoid';

const router = Router();

/**
 * POST /api/chat
 * Standard JSON endpoint for the clean chat interface
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const id = userId || nanoid();
  const surfaceId = `surface-${nanoid()}`;

  try {
    const result = await geminiAgent.processMessage(id, message, surfaceId);
    
    // Return direct JSON as requested for the clean chat interface
    res.json({
      text: result.text,
      a2uiMessages: result.a2uiMessages,
      dashboardData: result.dashboardData,
      userId: id,
      surfaceId
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

/**
 * POST /api/action
 * SSE endpoint for A2UI component actions
 */
router.post('/action', (req: Request, res: Response) => {
  const { userId, action, data, surfaceId } = req.body;

  if (!userId || !action) {
    res.status(400).json({ error: 'userId and action are required' });
    return;
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Process action and stream response
  (async () => {
    try {
      const response = await geminiAgent.handleUserAction(userId, action, data || {}, surfaceId);

      // Stream dashboard data if available
      if (response.dashboardData) {
        res.write(`data: ${JSON.stringify({ type: 'dashboard', content: response.dashboardData })}\n\n`);
      }

      // Stream A2UI messages
      for (const msg of response.a2uiMessages) {
        res.write(`data: ${JSON.stringify({ type: 'a2ui', content: msg })}\n\n`);
      }

      // Send text response if no A2UI messages
      if (response.a2uiMessages.length === 0) {
        res.write(`data: ${JSON.stringify({ type: 'text', content: response.text })}\n\n`);
      }

      // Send completion signal
      res.write(`data: ${JSON.stringify({ type: 'complete', userId })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Action error:', error);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          content: error instanceof Error ? error.message : 'An error occurred',
        })}\n\n`
      );
      res.end();
    }
  })();
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
