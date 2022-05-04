/**
 * Copyright 2022 Design Barn Inc.
 */

const { WatchDirectoryFlags } = require("typescript");

context("Player modifiers tests", () => {
    beforeEach(() => {
        cy.visit("http://localhost:8000/player-methods.html");
    });

    it("Load animation using loadAtIndex", function (done) {
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

    it("Load animation using loadAtId", function () {
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
    it.skip("Speeds up the animation x3", function (done) {

    });

    //setdirection
    it.skip("Changes the direction of the animation", function (done) {

    });

    //getLottie
    it.skip("Gets the Lottie animation data", function (done) {

    });

    it.skip("Pauses the animation.", function (done) {
        cy.get("#player-three").then(($el) => {
            const playerThree = $el.get(0);

            playerThree.addEventListener("ready", () => {
                playerThree.pause();
                expect(playerThree.currentState).to.eq("paused");
                done();
            });
        });
    });

    it.skip("Stops the animation.", function (done) {
    });

    it.skip("Takes a snapshot.", function (done) {
    });

    it.skip("Toggles playback.", function (done) {
    });

    it.skip("Defines looping.", function (done) {
    });

    it.skip("Seeks to 50% of the animation.", function (done) {
    });
});
