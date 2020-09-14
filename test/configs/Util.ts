import { join } from 'path';
import {
  AcceptPreferenceParser,
  BasicRequestParser,
  BasicTargetExtractor,
  BodyParser,
  CompositeAsyncHandler,
  DeleteOperationHandler,
  FileResourceStore,
  GetOperationHandler,
  HttpRequest,
  InMemoryResourceStore,
  InteractionController,
  MetadataController,
  Operation,
  PatchingStore,
  PatchOperationHandler,
  PostOperationHandler,
  PutOperationHandler,
  RawBodyParser,
  Representation,
  RepresentationConverter,
  RepresentationConvertingStore,
  ResourceStore,
  ResponseDescription,
  RuntimeConfig,
  SingleThreadedResourceLocker,
  SparqlUpdatePatchHandler,
  UrlBasedAclManager,
  UrlContainerManager,
  WebAclAuthorizer,
} from '../../index';
import { ExtensionBasedMapper } from '../../src/storage/ExtensionBasedMapper';

const BASE = 'http://test.com';

/**
 * Creates a RuntimeConfig with its rootFilePath set based on the given subfolder.
 * @param subfolder - Folder to use in the global testData folder.
 */
export const getRuntimeConfig = (subfolder: string): RuntimeConfig => new RuntimeConfig({
  base: BASE,
  rootFilepath: join(__dirname, '../testData', subfolder),
});

/**
 * Gives a file resource store based on (default) runtime config.
 * @param runtimeConfig - Optional runtime config.
 *
 * @returns The file resource store.
 */
export const getFileResourceStore = (runtimeConfig: RuntimeConfig): FileResourceStore =>
  new FileResourceStore(
    new ExtensionBasedMapper(runtimeConfig),
    new InteractionController(),
    new MetadataController(),
  );

/**
 * Gives an in memory resource store based on (default) base url.
 * @param base - Optional base parameter for the run time config.
 *
 * @returns The in memory resource store.
 */
export const getInMemoryResourceStore = (base = BASE): InMemoryResourceStore =>
  new InMemoryResourceStore(new RuntimeConfig({ base }));

/**
 * Gives a converting store given some converters.
 * @param store - Initial store.
 * @param converters - Converters to be used.
 *
 * @returns The converting store.
 */
export const getConvertingStore =
(store: ResourceStore, converters: RepresentationConverter[]): RepresentationConvertingStore =>
  new RepresentationConvertingStore(store, new CompositeAsyncHandler(converters));

/**
 * Gives a patching store based on initial store.
 * @param store - Inital resource store.
 *
 * @returns The patching store.
 */
export const getPatchingStore = (store: ResourceStore): PatchingStore => {
  const locker = new SingleThreadedResourceLocker();
  const patcher = new SparqlUpdatePatchHandler(store, locker);
  return new PatchingStore(store, patcher);
};

/**
 * Gives an operation handler given a store with all the common operation handlers.
 * @param store - Initial resource store.
 *
 * @returns The operation handler.
 */
export const getOperationHandler = (store: ResourceStore): CompositeAsyncHandler<Operation, ResponseDescription> => {
  const handlers = [
    new GetOperationHandler(store),
    new PostOperationHandler(store),
    new PutOperationHandler(store),
    new PatchOperationHandler(store),
    new DeleteOperationHandler(store),
  ];
  return new CompositeAsyncHandler<Operation, ResponseDescription>(handlers);
};

/**
 * Gives a basic request parser based on some body parses.
 * @param bodyParsers - Optional list of body parsers, default is RawBodyParser.
 *
 * @returns The request parser.
 */
export const getBasicRequestParser = (bodyParsers: BodyParser[] = []): BasicRequestParser => {
  let bodyParser: BodyParser;
  if (bodyParsers.length === 1) {
    bodyParser = bodyParsers[0];
  } else if (bodyParsers.length === 0) {
    // If no body parser is given (array is empty), default to RawBodyParser
    bodyParser = new RawBodyParser();
  } else {
    bodyParser = new CompositeAsyncHandler<HttpRequest, Representation | undefined>(bodyParsers);
  }
  return new BasicRequestParser({
    targetExtractor: new BasicTargetExtractor(),
    preferenceParser: new AcceptPreferenceParser(),
    bodyParser,
  });
};

/**
 * Gives a web acl authorizer, using a UrlContainerManager & based on a (default) runtimeConfig.
 * @param store - Initial resource store.
 * @param base - Base URI of the pod.
 * @param aclManager - Optional acl manager, default is UrlBasedAclManager.
 *
 * @returns The acl authorizer.
 */
export const getWebAclAuthorizer =
(store: ResourceStore, base = BASE, aclManager = new UrlBasedAclManager()): WebAclAuthorizer => {
  const containerManager = new UrlContainerManager(new RuntimeConfig({ base }));
  return new WebAclAuthorizer(aclManager, containerManager, store);
};
