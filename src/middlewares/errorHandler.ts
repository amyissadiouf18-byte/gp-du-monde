import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message, err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur.', error: err.message });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route introuvable.' });
}
