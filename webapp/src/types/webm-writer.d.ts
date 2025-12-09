declare module "webm-writer" {
  type WebMWriterConfig = {
    /**
     * Number of frames per second.
     */
    frameRate?: number;
    /**
     * Quality value between 0 and 0.99999.
     */
    quality?: number;
  };

  export default class WebMWriter {
    constructor(options?: WebMWriterConfig);
    addFrame(
      frame:
        | HTMLCanvasElement
        | OffscreenCanvas
        | ImageData
        | HTMLVideoElement
        | HTMLImageElement,
    ): void;
    complete(): Promise<Blob | void>;
  }
}
