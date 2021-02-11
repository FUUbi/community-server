import type {
  BaseEncodingOptions,
  MakeDirectoryOptions,
  Mode,
  PathLike,
  ReadStream,
  RmDirOptions,
  Stats,
  WriteStream,
} from 'fs';
import { Readable } from 'stream';
import { create } from 'ipfs';
import type { IPFS } from 'ipfs';
import { NotImplementedHttpError } from '../../util/errors/NotImplementedHttpError';
import { readableToString } from '../../util/StreamUtil';
import type { FsPromises, BufferEncoding } from './FsHelperTypes';

/* eslint-disable  @typescript-eslint/explicit-function-return-type  */
/* eslint-disable  mocha/valid-test-description  */
/* eslint-disable   @typescript-eslint/no-unused-vars */
/* eslint-disable   @typescript-eslint/ban-ts-comment */
export class IPFSHelper implements FsPromises {
  private readonly node: Promise<IPFS>;

  public constructor(config: { repo: string }) {
    this.node = create(config);
  }

  public async write(file: { path: string; content: Readable }) {
    const mfs = await this.mfs();
    return mfs.write(file.path, file.content, { create: true });
  }

  public async read(path: string) {
    const mfs = await this.mfs();
    return readableToString(Readable.from(mfs.read(path)));
  }

  public async stop() {
    return (await this.node).stop();
  }

  public async stats(path: string) {
    return (await this.mfs()).stat(path);
  }

  private async mfs() {
    return (await this.node).files;
  }

  private createWriteStream(path: PathLike): WriteStream {
    throw NotImplementedHttpError;
  }

  private createReadStream(path: PathLike): ReadStream {
    throw NotImplementedHttpError;
  }

  public async lstat(path: PathLike): Promise<Stats> {
    throw NotImplementedHttpError;
  }

  public async mkdir(
    path: PathLike,
    options: Mode | (MakeDirectoryOptions & { recursive?: false }) | null | undefined,
  ): Promise<void> {
    return Promise.resolve();
  }

  public async readdir(
    path: PathLike,
    options: (BaseEncodingOptions & { withFileTypes?: false }) | BufferEncoding | null | undefined,
  ): Promise<string[]> {
    return Promise.resolve([]);
  }

  public async rmdir(path: PathLike, options: RmDirOptions | undefined): Promise<void> {
    return Promise.resolve();
  }

  public async unlink(path: PathLike): Promise<void> {
    return Promise.resolve();
  }
}
