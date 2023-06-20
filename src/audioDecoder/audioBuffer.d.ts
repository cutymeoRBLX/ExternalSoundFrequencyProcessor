/**
 * AudioBuffer class
 */
export default class AudioBuffer {
    /**
     * Create AudioBuffer instance.
     * @constructor
     * @param {Object} options - buffer init options.
     * @param {number} options.length - buffer length in samples.
     * @param {number} options.sampleRate - buffer sample rate.
     * @param {number} options.numberOfChannels - number of channels.
     */
    constructor(options: {
        length: number;
        sampleRate: number;
        numberOfChannels: number;
    });
    sampleRate: number;
    numberOfChannels: number;
    length: number;
    duration: number;
    _data: Float32Array;
    _channelData: Float32Array[];
    /**
     * Return data associated with the channel.
     * @param {number} channel - Channel index, starting from 0.
     * @return {Float32Array} Array containing the data.
     */
    getChannelData(channel: number): Float32Array;
    /**
     * Place data to the destination buffer, starting from the position.
     * @param {Float32Array} destination - Destination array to write data to.
     * @param {number} channelNumber - Channel to take data from.
     * @param {number} startInChannel - Data offset in channel to read from.
     */
    copyFromChannel(destination: Float32Array, channelNumber: number, startInChannel: number): void;
    /**
     * Place data from the source to the channel, starting (in self) from the position.
     * @param {Float32Array | Array} source - source array to read data from.
     * @param {number} channelNumber - channel index to copy data to.
     * @param {number} startInChannel - offset in channel to copy data to.
     */
    copyToChannel(source: Float32Array | any[], channelNumber: number, startInChannel: number): void;
}
