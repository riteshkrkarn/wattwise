export class AILogger {
  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[AI-LOG] ${timestamp}: ${message}`;

    console.log(logMessage);

    if (data) {
      if (typeof data === "object") {
        try {
          console.log(JSON.stringify(data, null, 2));
        } catch (error) {
          console.log("[Data circular or not stringifiable]", data);
        }
      } else {
        console.log(data);
      }
    }
  }

  static error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(`[AI-ERROR] ${timestamp}: ${message}`);
    if (error) {
      console.error(error);
    }
  }
}
