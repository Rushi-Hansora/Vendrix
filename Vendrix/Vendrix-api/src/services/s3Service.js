const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../config/aws');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const uploadBuffer = async (buffer, mimetype, folder = 'uploads') => {
  const key = `${folder}/${uuidv4()}.pdf`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));
  logger.info(`File uploaded to S3: ${key}`);
  return key;
};

const uploadFile = uploadBuffer; // alias

const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }), { expiresIn });
};

const deleteFile = async (key) => {
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
  logger.info(`File deleted from S3: ${key}`);
};

module.exports = { uploadBuffer, uploadFile, getSignedDownloadUrl, deleteFile };
