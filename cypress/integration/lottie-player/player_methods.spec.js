/**
 * Copyright 2022 Design Barn Inc.
 */

const { WatchDirectoryFlags } = require("typescript");

context("Player modifiers tests", () => {
    beforeEach(() => {
        cy.visit("http://localhost:8000/player-methods.html");
    });

    it("3.1 Load animation using loadAtIndex", function (done) {
        cy.get("#player-four").then(($el) => {
            const playerFour = $el.get(0);

            playerFour.addEventListener(
                "ready",
                () => {
                    expect(playerFour.getAnimationIndex()).to.eq(1);
                    done();
                }
            );
        });
    });

    it("3.2 Load animation using loadAtId", function () {
        cy.get("#player-five").then(($el) => {
            const playerFive = $el.get(0);

            playerFive.addEventListener(
                "ready",
                () => {
                    expect(playerFive.getAnimationIndex()).to.eq(1);
                }
            );
        });
    });

    //setspeed
    it.skip("3.3 Speeds up the animation x3", function (done) {

    });

    //setdirection
    it.skip("3.4 Changes the direction of the animation", function (done) {

    });

    //getLottie
    it.skip("3.5 Gets the Lottie animation data", function (done) {

    });

    it.skip("3.6 Pauses the animation.", function (done) {
        cy.get("#player-three").then(($el) => {
            const playerThree = $el.get(0);

            playerThree.addEventListener("ready", () => {
                playerThree.pause();
                expect(playerThree.currentState).to.eq("paused");
                done();
            });
        });
    });

    it.skip("3.7 Stops the animation.", function (done) {
    });

    it.skip("3.8 Takes a snapshot.", function (done) {
    });

    it.skip("3.9 Toggles playback.", function (done) {
    });

    it.skip("3.10 Defines looping.", function (done) {
    });

    it.skip("3.11 Seeks to 50% of the animation.", function (done) {
    });
});
