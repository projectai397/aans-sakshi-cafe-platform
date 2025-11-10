import * as Sentry from '@sentry/node'
import { Express } from 'express'

export function initSentry(app: Express) {
  const sentryDsn = process.env.SENTRY_DSN
  const environment = process.env.NODE_ENV || 'development'

  if (!sentryDsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.')
    return
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
  })

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler())

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler())
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  })
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

export function setUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  })
}

export function clearUser() {
  Sentry.setUser(null)
}
