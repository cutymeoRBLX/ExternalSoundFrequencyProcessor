import express, { Express, Request, Response } from "express";
import compression from "compression";
import Meyda from "meyda";
import decodeAudio from "./audioDecoder/index"
import axios from "axios";

const serverApp: Express = express();
serverApp.use(compression());
serverApp.use(express.json());       
serverApp.use(express.urlencoded({extended: true})); 
serverApp.post("/", async (Request: Request, Response: Response) => {
    var audioUrl = Request.body.audioUrl;

    const initialAudioBuffer: ArrayBuffer = (await axios.get(audioUrl, {responseType: "arraybuffer"})).data;
    const audioBuffer: Buffer = Buffer.from(initialAudioBuffer);
    // Copied from the bot
    const FFT_SIZE: number = 512;

    let frequencyOutput: [[time: number, leftChannel: number, rightChannel: number, amplitudeSpan?: [Span: Array<number>, Length: number]]?] | string = [];
        
    let decodedData = await decodeAudio(audioBuffer);
    let channelData: Float32Array = decodedData.getChannelData(0);
    let bufferStep = Math.floor(channelData.length / FFT_SIZE); // floor just in case
    let currentTime = 0;

    const timeDelay = 1 / 15;
    let currentDelay = 0;

    for (let i = 0; i < bufferStep; i++) {
        currentTime += FFT_SIZE / decodedData.sampleRate;
        if (currentTime < currentDelay)
            continue;
        currentDelay = currentTime + timeDelay;

        let currentBufferData = channelData.slice(i * FFT_SIZE, (i + 1) * FFT_SIZE);
        let spectrum: Float32Array = Meyda.extract('amplitudeSpectrum', currentBufferData) as any;
        for (let j = 0; j < spectrum.length; j++) {
            spectrum[j] /= 100; // Matches un4seen BASS (osu!lazer)
        }
        frequencyOutput.push([currentTime, 0, 0, [Array.from(spectrum), spectrum.length]]);
    }

    return JSON.stringify(frequencyOutput);
});
serverApp.listen(8000, () => {
    console.log(`External Amplitude Processor: Ready to serve.`);
});