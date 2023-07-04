/**
 * Copyright 2022 Design Barn Inc.
 */

context("Player state", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8000/player-state.html");
  });

  it("5.1 Player-one should be autoplaying and looping.", function (done) {
    cy.get("#player-one").then(($el) => {
      const playerOne = $el.get(0);

      playerOne.addEventListener("frame", () => {
        expect(playerOne.currentState).to.eq("playing");
        expect(playerOne.isLooping()).to.eq(true);
        done();
      }, { once: true });
    });
  });

  it("5.2 Player-two should not be autoplaying.", function (done) {
    cy.get("#player-two").then(($el) => {
      const playerTwo = $el.get(0);

      playerTwo.addEventListener("ready", () => {
        expect(playerTwo.currentState).to.eq("loading");
        done();
      });
    });
  });

  it("5.3 Player-three should be paused.", function (done) {
    cy.get("#player-three").then(($el) => {
      const playerThree = $el.get(0);

      playerThree.addEventListener("ready", () => {
        playerThree.pause();
        expect(playerThree.currentState).to.eq("paused");
        done();
      });
    });
  });

  it("5.4 Player-four should resume playing.", function (done) {
    cy.get("#player-four").then(($el) => {
      const playerFour = $el.get(0);

      playerFour.addEventListener("ready", () => {
        playerFour.pause();
        playerFour.play();
        expect(playerFour.currentState).to.eq("playing");
        done();
      });
    });
  });

  it.skip("5.5 Player-five should be destroyed.", function (done) {
    cy.get("#player-five").then(($el) => {
      const playerFive = $el.get(0);

      playerFive.addEventListener("destroyed", (e) => {
        expect(playerFive.currentState).to.eq("destroyed");
        done();
      });

      playerFive.destroy();
    });
  });

  // Skipping due to trouble catching error with cypress
  it.skip("5.6 Player-six should have an error (bad url).", function (done) {
    cy.get("#player-six").then(($el) => {
      const playerSix = $el.get(0);

      cy.wait(3000);
      if (playerSix.currentState === "error")
        done();
    });
  });


  // Skipping due to trouble catching error with cypress
  it.skip("5.7 Player-seven should have an error (invalid json).", function (done) {
    cy.get("#player-seven").then(($el) => {
      const playerSeven = $el.get(0);

      cy.wait(3000);
      if (playerSeven.currentState === "error")
        done();
    });
  });

  it("5.8 Player-eight should play on hover.", function (done) {
    cy.get("#player-eight").then(($el) => {
      const playerEight = $el.get(0);

      playerEight.addEventListener("play", () => {
        expect(playerEight.currentState).to.eq("playing");
        done();
      });
    });
    cy.get("#player-eight").trigger("mouseenter");
  });

  // Leaving test for later implementation of loading from attributes
  it.skip("5.9 Player-nine should load it's second animation first.", function (done) {
    cy.get("#player-nine").then(($el) => {
      const playerNine = $el.get(0);

      playerNine.addEventListener("play", () => {
        expect(playerNine.getActiveAnimationIndex()).to.eq(1);
        done();
      });
    });
  });

  // Leaving test for later implementation of loading from attributes
  it.skip("5.10 Player-ten shoud play its first animation.", function (done) {
    cy.get("#player-ten").then(($el) => {
      const playerTen = $el.get(0);

      playerTen.addEventListener(
        "error",
        () => {
          expect(playerTen.currentState).to.eq("error");
          done();
        }
      );
    });
  });
});
