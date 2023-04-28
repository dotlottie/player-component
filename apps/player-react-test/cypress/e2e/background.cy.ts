describe('[dolottie-player]: Background', () => {
  it('should able set background color', () => {
    cy.load({
      background: 'rgb(26, 189, 70)',
    });

    cy.get('[data-testid="animation"]').should('have.css', 'background-color').and('eq', 'rgb(26, 189, 70)');
  });

  it('should be reactive', () => {
    cy.load({
      background: 'rgb(26, 189, 70)',
    });

    cy.updateProp('background', 'rgb(255, 0, 0)')
      .get('[data-testid="animation"]')
      .should('have.css', 'background-color')
      .and('eq', 'rgb(255, 0, 0)');
  });
});
