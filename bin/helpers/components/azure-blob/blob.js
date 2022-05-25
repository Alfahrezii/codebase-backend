
const azure = require('azure-storage');
const wrapper = require('../../utils/wrapper');
const logger = require('../../utils/logger');

class BLOB {
  constructor(config) {
    this.blobSvc = azure.createBlobService(config);
  }

  async createBlob(container, blobName, file) {
    const blob = this.blobSvc;
    const result = new Promise((resolve, reject) => {
      blob.createBlockBlobFromLocalFile(
        container, blobName, file, (error) => {
          if (!error) {
            logger.log('blob-createBlob', 'file uploaded', 'info');
            resolve(true);
          }
          logger.log('blob-createBlob', error, 'error');
          reject(error);
        }
      );
    });
    return Promise.resolve(result)
      .then(res => wrapper.data(res))
      .catch(err => wrapper.error(err));
  }

  async removeBlob(container, blobName) {
    const blob = this.blobSvc;
    const result = new Promise((resolve, reject) => {
      blob.deleteBlob(container, blobName, (error) => {
        if (!error) {
          logger.log('blob-removeBlob', 'file removed', 'info');
          resolve(true);
        }
        logger.log('blob-removeBlob', error, 'error');
        reject(error);
      });
    });
    return Promise.resolve(result)
      .then(res => wrapper.data(res))
      .catch(err => wrapper.error(err));
  }
}

module.exports = BLOB;
