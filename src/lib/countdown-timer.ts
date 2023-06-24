import { EventEmitter } from "events";

/**
 * Countdown Timer
 */
export class CountdownTimer<T> extends EventEmitter {
    private intervalId?: NodeJS.Timeout;

    /**
     * Constructor
     */
    constructor(countdownSeconds = 0) {
        super({ captureRejections: true });
        this._countdownSeconds = countdownSeconds;
    }

    private _countdownSeconds: number;

    get countdownSeconds(): number {
        return this._countdownSeconds;
    }

    private _payload?: T;

    get payload(): T | undefined {
        return this._payload;
    }

    private _remainingTime?: number;

    get remainingTime(): number | undefined {
        return this._remainingTime;
    }

    public get isRunning(): boolean {
        return this.intervalId !== undefined;
    }

    /**
     * Pause the countdown timer if it is running.
     * @emits paused - Emits paused event if running
     */
    public pause(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            this._remainingTime = this._countdownSeconds;
            this.emit("paused", this._payload);
        }
    }

    /**
     * Reset the countdown timer to its initial state.
     */
    public reset(): void {
        this.stop();
        this._countdownSeconds = 0;
        this._payload = undefined;
        this._remainingTime = undefined;
    }

    /**
     * Resume the countdown timer if it is paused.
     * @emits resumed - Emits resumed event if paused
     */
    public resume(): void {
        if (!this.intervalId) {
            this.intervalId = setInterval(this.countdown.bind(this), 1000);
            this.emit("resumed", this._payload);
        }
    }

    /**
     * Start a countdown timer.
     * @param seconds the number of seconds to count down from
     * @param payload the payload to send with each event
     * @emits countdown - Emits countdown event with the number of seconds remaining (including 0)
     * @emits stopped - Emits stopped event if manually stopped
     */
    public start(seconds: number, payload?: T): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this._countdownSeconds = seconds;
        if (payload) {
            this._payload = payload;
        }
        this.intervalId = setInterval(this.countdown.bind(this), 1000);
    }

    /**
     * Stop the countdown timer if it is running.
     * @emits stopped - Emits stopped event if running
     */
    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            this._countdownSeconds = 0;
            this._remainingTime = undefined;
            this.emit("stopped", this._payload);
        }
    }

    /**
     * Private method for the countdown logic.
     */
    private countdown(): void {
        if (this._countdownSeconds >= 0) {
            this.emit("countdown", this._countdownSeconds, this._payload);
            this._countdownSeconds--;
            this._remainingTime = this._countdownSeconds;
        } else {
            this.stop();
            this.emit("completed", this._payload);
        }
    }
}
