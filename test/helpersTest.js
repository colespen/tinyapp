const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return user obj with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOuput= {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.notStrictEqual(user, expectedOuput)
  });
  it('should return user obj with valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers)
    const expectedOuput= {
      id: 'user2RandomID',
      email: 'user2@example.com',
      password: 'dishwasher-funk'
    };
    assert.notStrictEqual(user, expectedOuput)
  });
  it('should return undefined, not equal', function() {
    const user = getUserByEmail("purple-monkey-dinosaur", testUsers)
    const expectedOuput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.notEqual(user, expectedOuput)
  });
  it('should return undefined, not equal', function() {
    const user = getUserByEmail("user9@example.com", testUsers)
    const expectedOuput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.notEqual(user, expectedOuput)
  });
  it('should return undefined, not equal', function() {
    const user = getUserByEmail("user9@example.com", testUsers)
    const expectedOuput = undefined;
    assert.equal(user, expectedOuput)
  });
});