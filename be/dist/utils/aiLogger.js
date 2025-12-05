"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AILogger = void 0;
class AILogger {
    static log(message, data) {
        const timestamp = new Date().toISOString();
        const logMessage = `[AI-LOG] ${timestamp}: ${message}`;
        console.log(logMessage);
        if (data) {
            if (typeof data === "object") {
                try {
                    console.log(JSON.stringify(data, null, 2));
                }
                catch (error) {
                    console.log("[Data circular or not stringifiable]", data);
                }
            }
            else {
                console.log(data);
            }
        }
    }
    static error(message, error) {
        const timestamp = new Date().toISOString();
        console.error(`[AI-ERROR] ${timestamp}: ${message}`);
        if (error) {
            console.error(error);
        }
    }
}
exports.AILogger = AILogger;
