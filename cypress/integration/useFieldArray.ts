describe('useFieldArray', () => {
  it('should behaviour correctly without defaultValues', () => {
    cy.visit('http://localhost:3000/useFieldArray/normal');

    cy.get('#append').click();
    cy.get('ul > li').its('length').should('equal', 1);

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: '2' }],
      }),
    );

    cy.get('#prepend').click();
    cy.get('ul > li').its('length').should('equal', 2);

    cy.get('ul > li').eq(0).get('input').should('have.value', '7');

    cy.get('#append').click();
    cy.get('ul > li').its('length').should('equal', 3);

    cy.get('ul > li').eq(2).find('input').should('have.value', '9');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: '7' }, { name: '2' }, { name: '9' }],
      }),
    );

    cy.get('#swap').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', '9');
    cy.get('ul > li').eq(2).find('input').should('have.value', '2');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: '7' }, { name: '9' }, { name: '2' }],
      }),
    );

    cy.get('#move').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', '2');
    cy.get('ul > li').eq(1).find('input').should('have.value', '7');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: '2' }, { name: '7' }, { name: '9' }],
      }),
    );

    cy.get('#insert').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', '22');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: '2' }, { name: '22' }, { name: '7' }, { name: '9' }],
      }),
    );

    cy.get('#remove').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', '2');
    cy.get('ul > li').eq(1).find('input').should('have.value', '7');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: '2' }, { name: '7' }, { name: '9' }],
      }),
    );

    cy.get('#delete1').click();

    cy.get('ul > li').its('length').should('equal', 2);

    cy.get('ul > li').eq(0).find('input').should('have.value', '2');
    cy.get('ul > li').eq(1).find('input').should('have.value', '9');

    cy.get('#delete1').click();

    cy.get('ul > li').its('length').should('equal', 1);

    cy.get('ul > li').eq(0).find('input').should('have.value', '2');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: '2' }],
      }),
    );

    cy.get('#update').click();

    cy.get('ul > li').eq(0).find('input').should('have.value', 'changed');

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [],
      }),
    );

    cy.get('#renderCount').contains('41');
  });

  it('should behaviour correctly with defaultValue', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');

    cy.get('ul > li').its('length').should('equal', 3);

    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');

    cy.get('ul > li').eq(1).find('input').should('have.value', 'test1');

    cy.get('ul > li').eq(2).find('input').should('have.value', 'test2');

    cy.get('#append').click();

    cy.get('ul > li').eq(3).find('input').should('have.value', '2');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: 'test' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#prepend').click();
    cy.get('ul > li').its('length').should('equal', 5);

    cy.get('ul > li').eq(0).get('input').should('have.value', '7');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: '7' },
          { name: 'test' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#swap').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', 'test1');
    cy.get('ul > li').eq(2).find('input').should('have.value', 'test');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: '7' },
          { name: 'test1' },
          { name: 'test' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#move').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '7');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: 'test' },
          { name: '7' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#insert').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', '20');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: 'test' },
          { name: '20' },
          { name: '7' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#remove').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '7');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: 'test' },
          { name: '7' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#delete2').click();

    cy.get('ul > li').its('length').should('equal', 4);

    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '7');
    cy.get('ul > li').eq(2).find('input').should('have.value', 'test2');
    cy.get('ul > li').eq(3).find('input').should('have.value', '2');

    cy.get('#delete3').click();

    cy.get('ul > li').its('length').should('equal', 3);

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: 'test' }, { name: '7' }, { name: 'test2' }],
      }),
    );

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [],
      }),
    );

    cy.get('#append').click();

    cy.get('ul > li').eq(0).find('input').should('have.value', '38');

    cy.get('#prepend').click();

    cy.get('ul > li').eq(0).find('input').should('have.value', '40');

    cy.get('#renderCount').contains('41');
  });

  it('should behaviour correctly with defaultValue and without auto focus', () => {
    cy.visit('http://localhost:3000/useFieldArray/defaultAndWithoutFocus');

    cy.get('ul > li').its('length').should('equal', 3);

    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');

    cy.get('ul > li').eq(1).find('input').should('have.value', 'test1');

    cy.get('ul > li').eq(2).find('input').should('have.value', 'test2');

    cy.get('#append').click();

    cy.get('ul > li').eq(3).find('input').should('have.value', '2');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: 'test' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#prepend').click();
    cy.get('ul > li').its('length').should('equal', 5);

    cy.get('ul > li').eq(0).get('input').should('have.value', '6');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: '6' },
          { name: 'test' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#swap').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', 'test1');
    cy.get('ul > li').eq(2).find('input').should('have.value', 'test');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: '6' },
          { name: 'test1' },
          { name: 'test' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#move').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '6');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: 'test' },
          { name: '6' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#insert').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', '18');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: 'test' },
          { name: '18' },
          { name: '6' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#remove').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '6');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: 'test' },
          { name: '6' },
          { name: 'test1' },
          { name: 'test2' },
          { name: '2' },
        ],
      }),
    );

    cy.get('#delete2').click();

    cy.get('ul > li').its('length').should('equal', 4);

    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '6');
    cy.get('ul > li').eq(2).find('input').should('have.value', 'test2');
    cy.get('ul > li').eq(3).find('input').should('have.value', '2');

    cy.get('#delete3').click();

    cy.get('ul > li').its('length').should('equal', 3);

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: 'test' }, { name: '6' }, { name: 'test2' }],
      }),
    );

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [],
      }),
    );

    cy.get('#append').click();

    cy.get('ul > li').eq(0).find('input').should('have.value', '35');

    cy.get('#prepend').click();

    cy.get('ul > li').eq(0).find('input').should('have.value', '36');

    cy.get('#renderCount').contains('37');
  });

  it('should replace fields with new values', () => {
    cy.get('#replace').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', '37. lorem');
    cy.get('ul > li').eq(1).find('input').should('have.value', '37. ipsum');
    cy.get('ul > li').eq(2).find('input').should('have.value', '37. dolor');
    cy.get('ul > li').eq(3).find('input').should('have.value', '37. sit amet');

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: '37. lorem' },
          { name: '37. ipsum' },
          { name: '37. dolor' },
          { name: '37. sit amet' },
        ],
      }),
    );
  });

  it('should display the correct dirty value with default value', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');
    cy.get('#dirty').contains('no');
    cy.get('#update').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }],
      }),
    );
    cy.get('#dirty').contains('yes');
    cy.get('#updateRevert').click();
    cy.get('#dirty').contains('no');
    cy.get('#append').click();
    cy.get('#field1').type('test');
    cy.get('#prepend').click();
    cy.get('#delete2').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }, { name: true }, {}, { name: true }],
      }),
    );
    cy.get('#delete2').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }, { name: true }, { name: true }],
      }),
    );
    cy.get('#delete1').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }, { name: true }, { name: true }],
      }),
    );
    cy.get('#delete1').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }, { name: true }, { name: true }],
      }),
    );
    cy.get('#delete0').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }, { name: true }, { name: true }],
      }),
    );
    cy.get('#dirty').contains('yes');
    cy.get('#renderCount').contains('15');
  });

  it('should display the correct dirty value without default value', () => {
    cy.visit('http://localhost:3000/useFieldArray/normal');
    cy.get('#dirty').contains('no');
    cy.get('#append').click();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }],
      }),
    );
    cy.get('#dirty').contains('yes');
    cy.get('#field0').type('test');
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#prepend').click();
    cy.get('#prepend').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }, { name: true }, { name: true }],
      }),
    );
    cy.get('#delete0').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }, { name: true }],
      }),
    );

    cy.get('#delete1').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: true }],
      }),
    );

    cy.get('#delete0').click();
    cy.get('#dirtyFields').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({}),
    );

    cy.get('#dirty').contains('yes');
  });

  it('should display the correct dirty value with default value', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');
    cy.get('#dirty').contains('no');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirty').contains('no');
    cy.get('#field0').type('test');
    cy.get('#dirty').contains('yes');
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').clear();
    cy.get('#field0').type('test');
    cy.get('#dirty').contains('no');
    cy.get('#delete1').click();
    cy.get('#dirty').contains('yes');
    cy.get('#append').click();
    cy.get('#field0').clear().type('test');
    cy.get('#field1').clear().type('test1');
    cy.get('#field2').clear().type('test2');
    cy.get('#dirty').contains('no');
  });

  it('should display the correct dirty value with async default value', () => {
    cy.visit('http://localhost:3000/useFieldArray/asyncReset');
    cy.get('#dirty').contains('no');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirty').contains('no');
    cy.get('#field0').type('test');
    cy.get('#dirty').contains('yes');
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').clear();
    cy.get('#field0').type('test');
    cy.get('#dirty').contains('no');
    cy.get('#delete1').click();
    cy.get('#dirty').contains('yes');
    cy.get('#append').click();
    cy.get('#field0').clear().type('test');
    cy.get('#field1').clear().type('test1');
    cy.get('#field2').clear().type('test2');
    cy.get('#dirty').contains('no');
  });

  it('should display correct error with the inputs', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');
    cy.get('#prepend').click();
    cy.get('#field1').clear();
    cy.get('#field2').clear();
    cy.get('#field3').clear();
    cy.get('#append').click();
    cy.get('#submit').click();
    cy.get('#error1').contains('This is required');
    cy.get('#error2').contains('This is required');
    cy.get('#error3').contains('This is required');
    cy.get('#field1').type('test');
    cy.get('#error1').should('not.exist');
    cy.get('#error2').contains('This is required');
    cy.get('#error3').contains('This is required');
    cy.get('#move').click();
    cy.get('#error0').contains('This is required');
    cy.get('#error2').should('not.exist');
    cy.get('#prepend').click();
    cy.get('#error0').should('not.exist');
    cy.get('#error1').contains('This is required');
  });

  it('should return correct touched values', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');
    cy.get('#field0').type('1');
    cy.get('#field1').type('1');
    cy.get('#field2').type('1');
    cy.get('#touched').contains('[{"name":true},{"name":true}]');
    cy.get('#append').click();
    cy.get('#prepend').click();
    cy.get('#touched').contains(
      '[null,{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#insert').click();
    cy.get('#touched').contains(
      '[{"name":true},null,{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#swap').click();
    cy.get('#touched').contains(
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#move').click();
    cy.get('#touched').contains(
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#insert').click();
    cy.get('#touched').contains(
      '[{"name":true},null,{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#delete4').click();
    cy.get('#touched').contains(
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
  });

  it('should return correct touched values without autoFocus', () => {
    cy.visit('http://localhost:3000/useFieldArray/defaultAndWithoutFocus');
    cy.get('#field0').type('1');
    cy.get('#field1').type('1');
    cy.get('#field2').type('1');
    cy.get('#touched').contains('[{"name":true},{"name":true}]');
    cy.get('#append').click();
    cy.get('#prepend').click();
    cy.get('#touched').contains(
      '[null,{"name":true},{"name":true},{"name":true},null]',
    );
    cy.get('#insert').click();
    cy.get('#touched').contains(
      '[null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    cy.get('#swap').click();
    cy.get('#touched').contains(
      '[null,{"name":true},null,{"name":true},{"name":true},null]',
    );
    cy.get('#move').click();
    cy.get('#touched').contains(
      '[null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    cy.get('#insert').click();
    cy.get('#touched').contains(
      '[null,null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    cy.get('#delete4').click();
    cy.get('#touched').contains(
      '[null,null,null,{"name":true},{"name":true},null]',
    );
  });

  it('should return correct isValid formState', () => {
    cy.visit('http://localhost:3000/useFieldArray/formState');
    cy.get('#isValid').get('#isValid').contains('yes');
    cy.get('#append').click();
    cy.get('#append').click();
    cy.get('#append').click();

    cy.get('#isValid').get('#isValid').contains('yes');

    cy.get('#field0').clear();

    cy.get('#isValid').get('#isValid').contains('no');

    cy.get('#delete0').click();
    cy.get('#field1').type('1');

    cy.get('#isValid').get('#isValid').contains('yes');

    cy.get('#field0').clear();

    cy.get('#isValid').get('#isValid').contains('no');

    cy.get('#delete0').click();

    cy.get('#isValid').get('#isValid').contains('yes');

    cy.get('#append').click();
    cy.get('#field0').clear();

    cy.get('#isValid').get('#isValid').contains('no');

    cy.get('#delete0').click();

    cy.get('#isValid').get('#isValid').contains('yes');

    cy.get('#append').click();
    cy.get('#append').click();

    cy.get('#field1').clear();
    cy.get('#field2').clear();

    cy.get('#isValid').get('#isValid').contains('no');

    cy.get('#delete1').click();
    cy.get('#delete1').click();

    cy.get('#isValid').get('#isValid').contains('yes');
  });
});
