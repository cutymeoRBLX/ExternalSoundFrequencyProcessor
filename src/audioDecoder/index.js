/**
 * Web-Audio-API decoder
 * @module  audio-decode
 */

import audioType from './audioType';
import AudioBuffer from './audioBuffer';

export default async function audioDecode (buf) {
	if (!buf && !(buf.length || buf.buffer)) throw Error('Bad decode target')
	buf = new Uint8Array(buf.buffer || buf)

	let type = audioType(buf);

	if (!type) throw Error('Cannot detect audio format');

	if (!decoders[type]) throw Error('Missing decoder for ' + type + ' format')

	return decoders[type](buf)
};

export const decoders = {
	async oga(buf) {
		let { OggVorbisDecoder } = await eval("import('@wasm-audio-decoders/ogg-vorbis')");
		const decoder = new OggVorbisDecoder()
		await decoder.ready;
		return (decoders.oga = async buf => buf && await createBuffer(await decoder.decodeFile(buf)))(buf)
	},
	async mp3(buf) {
		const { MPEGDecoder } = await eval("import('mpg123-decoder')");
		const decoder = new MPEGDecoder()
		await decoder.ready;
		return (decoders.mp3 = async buf => buf && await createBuffer(decoder.decode(buf)))(buf)
	},
	async flac(buf) {
		const { FLACDecoder } = await eval("import('@wasm-audio-decoders/flac')");
		const decoder = new FLACDecoder()
		await decoder.ready;
		return (decoders.mp3 = async buf => buf && await createBuffer(await decoder.decode(buf)))(buf)
	},
	async opus(buf) {
		const { OggOpusDecoder } = await eval("import('ogg-opus-decoder')");
		const decoder = new OggOpusDecoder()
		await decoder.ready;
		return (decoders.opus = async buf => buf && await createBuffer(await decoder.decodeFile(buf)))(buf)
	},
	async wav(buf) {
		let module = await eval("import('node-wav')");
		let { decode } = module.default
		return (decoders.wav = async buf => buf && await createBuffer(decode(buf)) )(buf)
	},
	async qoa(buf) {
		let { decode } = await eval("import('qoa-format')");
		return (decoders.qoa = async buf => buf && await createBuffer(decode(buf)) )(buf)
	}
}


async function createBuffer({channelData, sampleRate}) {
	let audioBuffer = new AudioBuffer({
		sampleRate,
		length: channelData[0].length,
		numberOfChannels: channelData.length
	})
	for (let ch = 0; ch < channelData.length; ch++) audioBuffer.getChannelData(ch).set(channelData[ch])
	return audioBuffer
}