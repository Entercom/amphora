'use strict';
var _ = require('lodash'),
  filename = _.startCase(__filename.split('/').pop().split('.').shift()),
  expect = require('chai').expect,
  sinon = require('sinon'),
  glob = require('glob'),
  config = require('config'),
  composer = require('./composer'),
  files = require('./files'),
  db = require('./db'),
  bluebird = require('bluebird'),
  log = require('./log'),
  plex = require('multiplex-templates'),
  references = require('./references');

function createMockRes() {
  var res = {};
  res.status = _.constant(res);
  res.send = _.constant(res);
  res.locals = {site: 'someSite'};
  return res;
}

describe(filename, function () {
  var sandbox,
    mockSite = 'mockSite';

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('renderComponent', function () {
    it('renderComponent data not found', function (done) {
      //not called for 404 Not Found
      sandbox.mock(log).expects('info').never();
      sandbox.mock(log).expects('warn').never();
      sandbox.mock(log).expects('error').never();

      //should not fetch template if there is no data, that would be a waste
      sandbox.mock(references).expects('getTemplate').never();

      //should attempt to fetch the data, for sure.
      sandbox.mock(references).expects('getComponentData').once().returns(bluebird.reject(new Error('thing')));

      var mockRes = createMockRes();

      composer.renderComponent('/components/whatever', mockRes).done(function (result) {
        //should not be
        done(result);
      }, function () {
        sandbox.verify();
        done();
      });
    });

    it('renderComponent data found', function (done) {
      //report what was served
      sandbox.mock(log).expects('info').once();

      //get the template that will be composed
      sandbox.mock(references).expects('getTemplate').once();

      //get the data that will be composed in the template
      sandbox.mock(references).expects('getComponentData').once().returns(bluebird.resolve({site: mockSite}));

      var mockRes = createMockRes();

      composer.renderComponent('/components/whatever', mockRes).done(function () {
        sandbox.verify();
        done();
      }, function (err) {
        done(err);
      });
    });
  });

  describe('renderPage', function () {

  });

});