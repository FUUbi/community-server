import type {
  PathLike, ReadStream, WriteStream,
  Stats, BaseEncodingOptions, MakeDirectoryOptions, Mode, RmDirOptions,
} from 'fs';

/* Figure out how to import BufferEncoding from node/globals  */
export type BufferEncoding =
    'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' |
    'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex';

export type CreateReadStream = (path: PathLike, options?: string | {
  flags?: string;
  encoding?: BufferEncoding;
  fd?: number;
  mode?: number;
  autoClose?: boolean;
  emitClose?: boolean;
  start?: number;
  end?: number;
  highWaterMark?: number;
}) => ReadStream;

export type CreateWriteStream = (path: PathLike, options?: string | {
  flags?: string;
  encoding?: BufferEncoding;
  fd?: number;
  mode?: number;
  autoClose?: boolean;
  emitClose?: boolean;
  start?: number;
  highWaterMark?: number;
}) => WriteStream;

// The used funcitons which the filesystem accessors use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FsPromises {

  /**
   * Asynchronous lstat(2) - Get file status. Does not dereference symbolic links.
   * @param path - A path to a file. If a URL is provided, it must use the `file:` protocol.
   */
  lstat: (path: PathLike) => Promise<Stats>;

  /**
   * Asynchronous unlink(2) - delete a name and possibly the file it refers to.
   * @param path - A path to a file. If a URL is provided, it must use the `file:` protocol.
   */
  unlink: (path: PathLike) => Promise<void>;

  /**
   * Asynchronous readdir(3) - read a directory.
   * @param path -    A path to a file. If a URL is provided, it must use the `file:` protocol.
   * @param options - The encoding (or an object specifying the encoding), used as the encoding of the result.
   *                  If not provided, `'utf8'` is used.
   */
  readdir: (path: PathLike, options?: BaseEncodingOptions & { withFileTypes?: false } | BufferEncoding | null) =>
  Promise<string[]>;

  /**
   * Asynchronous mkdir(2) - create a directory.
   * @param path - A path to a file. If a URL is provided, it must use the `file:` protocol.
   * @param options - Either the file mode, or an object optionally specifying the file mode and whether parent folders
   * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
   */
  mkdir: (path: PathLike, options?: Mode | (MakeDirectoryOptions & { recursive?: false }) | null) => Promise<void>;

  /**
   * Asynchronous rmdir(2) - delete a directory.
   * @param path - A path to a file. If a URL is provided, it must use the `file:` protocol.
   */
  rmdir: (path: PathLike, options?: RmDirOptions) => Promise<void>;
}
