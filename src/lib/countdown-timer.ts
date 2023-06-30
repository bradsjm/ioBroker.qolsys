import { EventEmitter } from "events";

/**
 * Countdown Timer
 */
export class CountdownTimer<T> extends EventEmitter {
    private intervalId?: NodeJS.Timeout;

    /**
     * The constructor function for the CountdownTimer class.
     *
     * @return A new instance of the class
     */
    constructor() {
        super();
        this._countdownSeconds = this._remainingTime = 0;
    }

    private _countdownSeconds: number;

    /**
     * Returns the original number of seconds set for the countdown.
     *
     * @return {number} Number of seconds set for the countdown.
     */
    get countdownSeconds(): number {
        return this._countdownSeconds;
    }

    private _payload?: T;

    /**
     * Returns the payload of the action.
     *
     * @return The payload of the action
     */
    get payload(): T | undefined {
        return this._payload;
    }

    private _remainingTime: number;

    /**
     * Returns the remaining time in seconds.
     *
     * @return {number} The remaining time if running.
     */
    get remainingTime(): number {
        return this._remainingTime;
    }

    /**
     * The isRunning function returns a boolean value indicating whether the timer is currently running.
     *
     * @return A boolean value that is true if the timer is running and false otherwise
     */
    public get isRunning(): boolean {
        return this.intervalId !== undefined;
    }

    /**
     * Pause the countdown timer if it is running.
     *
     * @emits paused - Emits paused event if running
     */
    public pause(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            this.emit("paused", this._payload);
        }
    }

    /**
     * Resume the countdown timer if it is paused and there is remaining time.
     *
     * @emits resumed - Emits resumed event if paused
     */
    public resume(): void {
        if (!this.intervalId && this._remainingTime > 0) {
            this.intervalId = setInterval(this.countdown.bind(this), 1000);
            this.emit("resumed", this._payload);
        }
    }

    /**
     * Start a countdown timer from the specified number of seconds with optional payload.
     *
     * @param seconds {number} the number of seconds to count down
     * @param payload the optional payload to send with each event
     */
    public start(seconds: number, payload?: T): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this._remainingTime = this._countdownSeconds = seconds;
        if (payload) {
            this._payload = payload;
        }
        this._remainingTime = this._countdownSeconds;
        this.intervalId = setInterval(this.countdown.bind(this), 1000);
    }

    /**
     * Stop the countdown timer if it is running.
     *
     * @emits stopped - Emits stopped event if running
     */
    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            this.emit("stopped", this._payload);
        }
    }

    /**
     * The countdown function is called every second by the timer.
     * It emits a countdown event with the remaining time and payload,
     * and when it reaches 0, it emits a completed event with the payload.
     *
     * @emits countdown - Emits countdown event
     * @emits completed - Emits completed event
     */
    private countdown(): void {
        if (this._remainingTime >= 0) {
            this.emit("countdown", this._remainingTime, this._payload);
            this._remainingTime--;
        } else {
            this.stop();
            this.emit("completed", this._payload);
        }
    }
}
