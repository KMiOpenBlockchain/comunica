import {ActorRdfMetadataExtract} from "@comunica/bus-rdf-metadata-extract";
import {Bus} from "@comunica/core";
import {Readable} from "stream";
import {ActorRdfMetadataExtractSparqlService} from "../lib/ActorRdfMetadataExtractSparqlService";
const stream = require('streamify-array');
const quad = require('rdf-quad');

describe('ActorRdfMetadataExtractSparqlService', () => {
  let bus;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('The ActorRdfMetadataExtractSparqlService module', () => {
    it('should be a function', () => {
      expect(ActorRdfMetadataExtractSparqlService).toBeInstanceOf(Function);
    });

    it('should be a ActorRdfMetadataExtractSparqlService constructor', () => {
      expect(new (<any> ActorRdfMetadataExtractSparqlService)({ name: 'actor', bus }))
        .toBeInstanceOf(ActorRdfMetadataExtractSparqlService);
      expect(new (<any> ActorRdfMetadataExtractSparqlService)({ name: 'actor', bus }))
        .toBeInstanceOf(ActorRdfMetadataExtract);
    });

    it('should not be able to create new ActorRdfMetadataExtractSparqlService objects without \'new\'', () => {
      expect(() => { (<any> ActorRdfMetadataExtractSparqlService)(); }).toThrow();
    });
  });

  describe('An ActorRdfMetadataExtractSparqlService instance', () => {
    let actor: ActorRdfMetadataExtractSparqlService;
    let input: Readable;
    let inputNone: Readable;
    let inputRelative: Readable;

    beforeEach(() => {
      actor = new ActorRdfMetadataExtractSparqlService({ name: 'actor', bus });
      input = stream([
        quad('s1', 'p1', 'o1', ''),
        quad('http://example.org/', 'http://www.w3.org/ns/sparql-service-description#endpoint', 'http://example2.org/ENDPOINT', ''),
        quad('s2', 'px', '5678', ''),
        quad('s3', 'p3', 'o3', ''),
      ]);
      inputNone = stream([
        quad('s1', 'p1', 'o1', ''),
      ]);
      inputRelative = stream([
        quad('s1', 'p1', 'o1', ''),
        quad('http://example.org/', 'http://www.w3.org/ns/sparql-service-description#endpoint', 'ENDPOINT', ''),
        quad('s2', 'px', '5678', ''),
        quad('s3', 'p3', 'o3', ''),
      ]);
    });

    it('should test', () => {
      return expect(actor.test({ url: 'http://example.org/', metadata: input })).resolves.toBeTruthy();
    });

    it('should run on a stream where an endpoint is defined', () => {
      return expect(actor.run({ url: 'http://example.org/', metadata: input })).resolves
        .toEqual({ metadata: { sparqlService: 'http://example2.org/ENDPOINT' }});
    });

    it('should run on a stream where an endpoint is defined, but for another URL', () => {
      return expect(actor.run({ url: 'http://example2.org/', metadata: input })).resolves
        .toEqual({ metadata: {}});
    });

    it('should run on a stream where an endpoint is not given', () => {
      return expect(actor.run({ url: 'http://example.org/', metadata: inputNone })).resolves
        .toEqual({ metadata: {}});
    });

    it('should run on a stream where an endpoint is defined as a relative IRI', () => {
      return expect(actor.run({ url: 'http://example.org/', metadata: inputRelative })).resolves
        .toEqual({ metadata: { sparqlService: 'http://example.org/ENDPOINT' }});
    });
  });
});
