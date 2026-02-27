'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

// ============================================================================
// Server Attributes
// ============================================================================
const ATTRIBUTES = {
  // OTA Upgrade Cluster Attributes (0x0000 - 0x000C)

  // The IEEE address of the upgrade server resulted from the discovery of the
  // upgrade server's identity. If the value is set to a non-zero value and
  // corresponds to an IEEE address of a device that is no longer accessible, a
  // device MAY choose to discover a new Upgrade Server depending on its own
  // security policies.
  upgradeServerID: { id: 0x0000, type: ZCLDataTypes.EUI64 }, // Mandatory

  // The parameter indicates the current location in the OTA upgrade image. It is
  // essentially the (start of the) address of the image data that is being
  // transferred from the OTA server to the client.
  fileOffset: { id: 0x0001, type: ZCLDataTypes.uint32 }, // Optional

  // The file version of the running firmware image on the device.
  currentFileVersion: { id: 0x0002, type: ZCLDataTypes.uint32 }, // Optional

  // The ZigBee stack version of the running image on the device.
  currentZigBeeStackVersion: { id: 0x0003, type: ZCLDataTypes.uint16 }, // Optional

  // The file version of the downloaded image on additional memory space on the
  // device.
  downloadedFileVersion: { id: 0x0004, type: ZCLDataTypes.uint32 }, // Optional

  // The ZigBee stack version of the downloaded image on additional memory space
  // on the device.
  downloadedZigBeeStackVersion: { id: 0x0005, type: ZCLDataTypes.uint16 }, // Optional

  // The upgrade status of the client device. The status indicates where the client
  // device is at in terms of the download and upgrade process.
  imageUpgradeStatus: { // Mandatory
    id: 0x0006,
    type: ZCLDataTypes.enum8({
      normal: 0x00,
      downloadInProgress: 0x01,
      downloadComplete: 0x02,
      waitingToUpgrade: 0x03,
      countDown: 0x04,
      waitForMore: 0x05,
      waitingToUpgradeViaExternalEvent: 0x06,
    }),
  },

  // The ZigBee assigned value for the manufacturer of the device.
  manufacturerID: { id: 0x0007, type: ZCLDataTypes.uint16 }, // Optional

  // The image type identifier of the file that the client is currently downloading,
  // or a file that has been completely downloaded but not upgraded to yet.
  imageTypeID: { id: 0x0008, type: ZCLDataTypes.uint16 }, // Optional

  // This attribute acts as a rate limiting feature for the server to slow down the
  // client download and prevent saturating the network with block requests. The
  // value is in milliseconds.
  minimumBlockPeriod: { id: 0x0009, type: ZCLDataTypes.uint16 }, // Optional

  // A 32 bit value used as a second verification to identify the image. The value
  // must be consistent during the lifetime of the same image and unique for each
  // different build of the image.
  imageStamp: { id: 0x000A, type: ZCLDataTypes.uint32 }, // 10, Optional

  // Indicates what behavior the client device supports for activating a fully
  // downloaded but not installed upgrade image.
  upgradeActivationPolicy: { // Optional
    id: 0x000B, // 11
    type: ZCLDataTypes.enum8({
      otaServerActivationAllowed: 0x00,
      outOfBandActivationOnly: 0x01,
    }),
  },

  // Dictates the behavior of the device in situations where an explicit activation
  // command cannot be retrieved.
  upgradeTimeoutPolicy: { // Optional
    id: 0x000C, // 12
    type: ZCLDataTypes.enum8({
      applyUpgradeAfterTimeout: 0x00,
      doNotApplyUpgradeAfterTimeout: 0x01,
    }),
  },
};

// Response to the Image Block Request or Image Page Request. The payload varies
// based on the status field.
const IMAGE_BLOCK_RESPONSE = {
  id: 0x0005,
  encodeMissingFieldsBehavior: 'skip',
  args: {
    status: ZCLDataTypes.enum8Status,
    // When status is SUCCESS
    manufacturerCode: ZCLDataTypes.uint16,
    imageType: ZCLDataTypes.uint16,
    fileVersion: ZCLDataTypes.uint32,
    fileOffset: ZCLDataTypes.uint32,
    dataSize: ZCLDataTypes.uint8,
    imageData: ZCLDataTypes.buffer,
    // When status is WAIT_FOR_DATA
    currentTime: ZCLDataTypes.uint32,
    requestTime: ZCLDataTypes.uint32,
    minimumBlockPeriod: ZCLDataTypes.uint16,
  },
};

// ============================================================================
// Commands
// ============================================================================
const COMMANDS = {
  // --- Server to Client Commands ---

  // The purpose of sending Image Notify command is so the server has a way to
  // notify client devices of when the OTA upgrade images are available for them.
  imageNotify: { // Optional
    id: 0x0000,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    encodeMissingFieldsBehavior: 'skip',
    frameControl: ['directionToClient', 'clusterSpecific', 'disableDefaultResponse'],
    args: {
      payloadType: ZCLDataTypes.enum8({
        queryJitter: 0x00,
        queryJitterAndManufacturerCode: 0x01,
        queryJitterAndManufacturerCodeAndImageType: 0x02,
        queryJitterAndManufacturerCodeAndImageTypeAndNewFileVersion: 0x03,
      }),
      queryJitter: ZCLDataTypes.uint8,
      // Present when payloadType >= 0x01
      manufacturerCode: ZCLDataTypes.uint16,
      // Present when payloadType >= 0x02
      imageType: ZCLDataTypes.uint16,
      // Present when payloadType >= 0x03
      newFileVersion: ZCLDataTypes.uint32,
    },
  },

  // --- Client to Server Commands ---

  // Client queries the server if new OTA upgrade image is available.
  queryNextImageRequest: { // Mandatory
    id: 0x0001,
    encodeMissingFieldsBehavior: 'skip',
    args: {
      fieldControl: ZCLDataTypes.map8('hardwareVersionPresent'),
      manufacturerCode: ZCLDataTypes.uint16,
      imageType: ZCLDataTypes.uint16,
      fileVersion: ZCLDataTypes.uint32,
      // Present when fieldControl bit 0 is set
      hardwareVersion: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0002,
      encodeMissingFieldsBehavior: 'skip',
      args: {
        status: ZCLDataTypes.enum8Status,
        // Remaining fields only present when status is SUCCESS
        manufacturerCode: ZCLDataTypes.uint16,
        imageType: ZCLDataTypes.uint16,
        fileVersion: ZCLDataTypes.uint32,
        imageSize: ZCLDataTypes.uint32,
      },
    },
  },

  // Client requests a block of data from the OTA upgrade image.
  imageBlockRequest: { // Mandatory
    id: 0x0003,
    encodeMissingFieldsBehavior: 'skip',
    args: {
      fieldControl: ZCLDataTypes.map8(
        'requestNodeAddressPresent',
        'minimumBlockPeriodPresent',
      ),
      manufacturerCode: ZCLDataTypes.uint16,
      imageType: ZCLDataTypes.uint16,
      fileVersion: ZCLDataTypes.uint32,
      fileOffset: ZCLDataTypes.uint32,
      maximumDataSize: ZCLDataTypes.uint8,
      // Present when fieldControl bit 0 is set
      requestNodeAddress: ZCLDataTypes.EUI64,
      // Present when fieldControl bit 1 is set
      minimumBlockPeriod: ZCLDataTypes.uint16,
    },
    response: IMAGE_BLOCK_RESPONSE,
  },

  // Client requests pages of data from the OTA upgrade image. Using Image Page
  // Request reduces the number of requests sent from the client to the upgrade
  // server, compared to using Image Block Request command.
  imagePageRequest: { // Optional
    id: 0x0004,
    encodeMissingFieldsBehavior: 'skip',
    args: {
      fieldControl: ZCLDataTypes.map8('requestNodeAddressPresent'),
      manufacturerCode: ZCLDataTypes.uint16,
      imageType: ZCLDataTypes.uint16,
      fileVersion: ZCLDataTypes.uint32,
      fileOffset: ZCLDataTypes.uint32,
      maximumDataSize: ZCLDataTypes.uint8,
      pageSize: ZCLDataTypes.uint16,
      responseSpacing: ZCLDataTypes.uint16,
      // Present when fieldControl bit 0 is set
      requestNodeAddress: ZCLDataTypes.EUI64,
    },
    response: IMAGE_BLOCK_RESPONSE,
  },

  imageBlockResponse: IMAGE_BLOCK_RESPONSE,

  // Sent by the client when it has completed downloading an image. The status
  // value SHALL be SUCCESS, INVALID_IMAGE, REQUIRE_MORE_IMAGE, or ABORT.
  upgradeEndRequest: { // Mandatory
    id: 0x0006,
    args: {
      status: ZCLDataTypes.enum8Status,
      manufacturerCode: ZCLDataTypes.uint16,
      imageType: ZCLDataTypes.uint16,
      fileVersion: ZCLDataTypes.uint32,
    },
    response: {
      id: 0x0007,
      args: {
        manufacturerCode: ZCLDataTypes.uint16,
        imageType: ZCLDataTypes.uint16,
        fileVersion: ZCLDataTypes.uint32,
        currentTime: ZCLDataTypes.uint32,
        upgradeTime: ZCLDataTypes.uint32,
      },
    },
  },

  // --- Server to Client Commands ---

  // Response to the Upgrade End Request, indicating when the client should upgrade
  // to the new image.
  upgradeEndResponse: { // Mandatory
    id: 0x0007,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      manufacturerCode: ZCLDataTypes.uint16,
      imageType: ZCLDataTypes.uint16,
      fileVersion: ZCLDataTypes.uint32,
      currentTime: ZCLDataTypes.uint32,
      upgradeTime: ZCLDataTypes.uint32,
    },
  },

  // Client requests a device specific file such as security credential,
  // configuration or log.
  queryDeviceSpecificFileRequest: { // Optional
    id: 0x0008,
    args: {
      requestNodeAddress: ZCLDataTypes.EUI64,
      manufacturerCode: ZCLDataTypes.uint16,
      imageType: ZCLDataTypes.uint16,
      fileVersion: ZCLDataTypes.uint32,
      zigBeeStackVersion: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0009,
      args: {
        status: ZCLDataTypes.enum8Status,
        manufacturerCode: ZCLDataTypes.uint16,
        imageType: ZCLDataTypes.uint16,
        fileVersion: ZCLDataTypes.uint32,
        imageSize: ZCLDataTypes.uint32,
      },
    },
  },

};

class OTACluster extends Cluster {

  static get ID() {
    return 0x0019; // 25
  }

  static get NAME() {
    return 'ota';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(OTACluster);

module.exports = OTACluster;
