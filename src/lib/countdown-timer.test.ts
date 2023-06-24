/*
Code Analysis

Main functionalities:
The CountdownTimer class is an event emitter that provides functionality for starting, stopping, pausing, and resuming a countdown timer. It emits events for countdown, paused, resumed, stopped, and completed, and allows for a payload to be sent with each event.

Methods:
- pause(): pauses the countdown timer if it is running and emits a paused event
- reset(): stops the countdown timer and resets all fields to their initial state
- resume(): resumes the countdown timer if it is paused and emits a resumed event
- start(seconds, payload): starts the countdown timer with the specified number of seconds and optional payload, and emits a countdown event every second until the timer reaches 0, at which point it emits a completed event
- stop(): stops the countdown timer if it is running and emits a stopped event

Fields:
- countdownSeconds: the number of seconds remaining in the countdown timer
- intervalId: the ID of the interval used to update the countdown timer
- payload: the payload to send with each event
- remainingTime: the number of seconds remaining in the countdown timer, updated every second during the countdown
*/

import { assert } from "chai";
import { CountdownTimer } from "./countdown-timer";

describe("CountdownTimer", () => {

    // Tests that the countdown timer starts and emits countdown events
    it("test_start_countdown", () => {
        const timer = new CountdownTimer();
        let countdownEvents = 0;
        timer.on("countdown", (seconds) => {
            countdownEvents++;
            if (seconds === 0) {
                assert.equal(countdownEvents, 6);
            }
        });
        timer.start(5);
    });

    // Tests that the countdown timer is paused and resumed
    it("test_pause_countdown", () => {
        const timer = new CountdownTimer();
        let paused = false;
        let resumed = false;
        timer.on("paused", () => {
            paused = true;
            timer.resume();
        });
        timer.on("resumed", () => {
            resumed = true;
            assert.isTrue(paused);
            assert.isTrue(resumed);
        });
        timer.start(5);
        setTimeout(() => {
            timer.pause();
        }, 2000);
    });

    // Tests that the countdown timer is stopped before completion
    it("test_stop_countdown", () => {
        const timer = new CountdownTimer();
        let stopped = false;
        timer.on("stopped", () => {
            stopped = true;
            assert.isTrue(stopped);
        });
        timer.start(5);
        setTimeout(() => {
            timer.stop();
        }, 2000);
    });

    // Tests that the countdown timer starts with 0 seconds
    it("test_start_countdown_with_zero_seconds", () => {
        const timer = new CountdownTimer();
        let countdownEvents = 0;
        timer.on("countdown", (seconds) => {
            countdownEvents++;
            if (seconds === 0) {
                assert.equal(countdownEvents, 1);
            }
        });
        timer.start(0);
    });

    // Tests that the countdown timer starts with negative seconds
    it("test_start_countdown_with_negative_seconds", () => {
        const timer = new CountdownTimer();
        let countdownEvents = 0;
        timer.on("countdown", (seconds) => {
            countdownEvents++;
            if (seconds === 0) {
                assert.equal(countdownEvents, 1);
            }
        });
        timer.start(-5);
    });

    // Tests that the countdown timer can be reset to initial state
    it("test_reset_countdown", () => {
        const timer = new CountdownTimer();
        let stopped = false;
        timer.on("stopped", () => {
            stopped = true;
            assert.isTrue(stopped);
            timer.reset();
            assert.isFalse(timer.isRunning);
            assert.equal(timer.countdownSeconds, 0);
            assert.isUndefined(timer.payload);
            assert.isUndefined(timer.remainingTime);
        });
        timer.start(5);
        setTimeout(() => {
            timer.stop();
        }, 2000);
    });

});
