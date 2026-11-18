type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private formatLog(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
    return `${prefix} ${entry.message}${dataStr}`;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        if (this.isDev) console.log(formatted);
        break;
      default:
        console.log(formatted);
    }

    // In production, you could send to external logging service
    // this.sendToExternalService(entry);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log("warn", message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log("error", message, data);
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log("debug", message, data);
  }

  // Log webhook events
  webhook(event: string, data?: Record<string, unknown>) {
    this.info(`WEBHOOK: ${event}`, data);
  }

  // Log DM sends
  dm(action: string, campaignId: string, userId: string, success: boolean) {
    this.info(`DM: ${action}`, {
      campaignId,
      userId,
      success,
    });
  }
}

export const logger = new Logger();
