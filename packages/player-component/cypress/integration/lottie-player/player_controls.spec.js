/**
 * Copyright 2022 Design Barn Inc.
 */

context("Player controls", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8000/player-controls.html");
    cy.wait(3000);
  });

  it("2.1 clicks on play button and verifies animation is playing", function (done) {
    cy.get("#player-one").then(($el) => {
      const playerOne = $el.get(0);
      cy.get("#player-one").shadow().find("#lottie-play-button").click();

      playerOne.addEventListener("play", () => {
        expect(playerOne.currentState).to.eq("playing");
        done();
      });
    });
  });

  it("2.2 clicks on pause button and verifies animation is paused", function (done) {
    cy.get("#player-two").then(($el) => {
      const playerTwo = $el.get(0);

      playerTwo.addEventListener("pause", () => {
        expect(playerTwo.currentState).to.eq("paused");
        done();
      });

    });

    cy.get("#player-two")
      .shadow()
      .find("#lottie-play-button")
      .click();

  });

  it("2.3 clicks on stop button and verififes animation is stopped and at frame 0", function (done) {
    // #lottie-stop-button
    cy.get("#player-three").then(($el) => {
      const playerThree = $el.get(0);

      playerThree.addEventListener("stop", () => {
        expect(playerThree.currentState).to.eq("stopped");
        expect(playerThree.getLottie().currentFrame).to.eq(0);
        done();
      });
    });

    cy.get("#player-three")
      .shadow()
      .find("#lottie-stop-button")
      .click();
  });

  it("2.4 clicks on loop button and verififes animation loops", function (done) {
    cy.get("#player-four")
      .shadow()
      .find("#lottie-loop-toggle")
      .click();
    cy.get("#player-four").then(($el) => {
      const playerFour = $el.get(0);

      expect(playerFour.loop).to.eq(true);
      done();
    });
  });
});
