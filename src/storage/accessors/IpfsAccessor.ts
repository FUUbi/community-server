import { IPFSHelper } from '../ipfs/IpfsHelper';
import type { FileIdentifierMapper } from '../mapping/FileIdentifierMapper';
import { FileDataAccessor } from './FileDataAccessor';

export class IpfsAccessor extends FileDataAccessor {
  public constructor(resourceMapper: FileIdentifierMapper) {
    super(resourceMapper);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.fsPromises = new IPFSHelper({ repo: '.ipfs-folder/' });
  }
}
