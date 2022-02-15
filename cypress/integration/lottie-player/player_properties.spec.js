/**
 * Copyright 2022 Design Barn Inc.
 */

context("Player properties", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8000/player-properties.html");
  });

  it("Player-one Should have a green background.", () => {
    cy.get("#player-one")
      .shadow()
      .find(".animation")
      .should("have.css", "background-color")
      .and("eq", "rgb(0, 255, 107)");
  });

  it("Player-two should play twice.", function (done) {
    cy.get("#player-two").then(($el) => {
      const playerTwo = $el.get(0);
      let ctr = 0;

      playerTwo.addEventListener("ready", () => {
        playerTwo.getLottie().addEventListener("complete", () => {
          ctr++;
          if (ctr >= 2) {
            done();
          }
        });
      });
    });
  });

  // aria labels not implemented yet
  it.skip("Player-three should have a description set.", () => {
    cy.get("#player-three")
      .shadow()
      .find("animation")
      .should("have.attr", "aria-label")
      .and("eq", "I am a description!");
  });

  it("Player-four should play in reverse.", function (done) {
    cy.get("#player-four").then(($el) => {
      const playerFour = $el.get(0);

      playerFour.addEventListener("ready", () => {
        expect(playerFour.getLottie().currentFrame).eq(54);

        playerFour.getLottie().addEventListener("complete", () => {
          expect(playerFour.getLottie().currentFrame).eq(0);
          if (playerFour.getLottie().currentFrame === 0) done();
        });
      });
    });
  });

  // todo
  it.skip("Player-five plays a second time after 5 seconds have elapsed.", () => {});

  it("Player-six should play on hover.", function (done) {
    cy.get("#player-six").wait(1000).then(($el) => {
      const playerSix = $el.get(0);

      playerSix.addEventListener(
        "play",
        () => {
          console.log("playing player six");
          expect(playerSix.currentState).to.eq("playing");
          done();
        },
        { once: true }
      );
    });
    cy.get("#player-six").trigger("mouseenter");
  });

  it("Player-seven should loop", function (done) {
    cy.get("#player-seven").then(($el) => {
      const playerSeven = $el.get(0);

      playerSeven.addEventListener("play", () => {
        expect(playerSeven.loop).to.eq(true);
        done();
      });
    });
  });

  it("Player-eight should play with the bounce mode", function (done) {
    cy.get("#player-eight").then(($el) => {
      const playerTwelve = $el.get(0);
      let counter = 0;
      let testOne = false;
      let testTwo = false;

      playerTwelve.addEventListener("ready", () => {
        playerTwelve.getLottie().addEventListener("complete", () => {
          if (counter === 0) {
            expect(playerTwelve.getLottie().playDirection).to.eq(1);
            testOne = playerTwelve.getLottie().playDirection;
          } else if (counter === 1) {
            expect(playerTwelve.getLottie().playDirection).to.eq(-1);
            testTwo = playerTwelve.getLottie().playDirection;
          }
  
          if (testOne === 1 && testTwo === -1) done();
          counter++;
        });  
      });
    });
  });

  it.skip("Player-nine should have its aspect-ratio set to xMidYMid meet", () => {
    cy.get("#player-nine")
      .shadow()
      .find(".animation")
      .children()
      .should("have.attr", "preserveAspectRatio")
      .and("eq", "xMaxYMid meet");
  });

  // renderer
  it.skip("Should render using the svg renderer [todo]", () => {});

  // renderer
  it.skip("Should render using the canvas renderer [todo]", () => {});

  // seeker - currently seeker property is ignored if autoplay is true
  it.skip("Should be at frame 55", function(done) {
    cy.get("#player-twelve").then(($el) => {
      const playerTwelve = $el.get(0);

      playerTwelve.addEventListener("ready", () => {
        cy.wait(2000);
        setTimeout(() => {          
          console.log(playerTwelve.getLottie().currentFrame);
          console.log(playerTwelve.seeker);
          cy.expect(playerTwelve.getLottie().currentFrame).to.eq(55);
        }, (3000));


        console.log("CF: " + playerTwelve.getLottie().currentFrame);
      });
    });
  });

  it("Player-thirteen should play at x5 the speed", () => {
    cy.get("#player-thirteen").then(($el) => {
      const playerThirteen = $el.get(0);

      expect(playerThirteen.speed).to.eq(5);
    });
  });

  // webworkers
  it.skip("webworkers [todo]", () => {});
});
