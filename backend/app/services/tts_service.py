import torch
import wave
import io
import numpy as np
import logging
import os
from app.config import settings

try:
    from continue_tts import Continue1Model
except Exception as _import_err:
    Continue1Model = None
    logging.getLogger(__name__).warning("continue_tts package not available yet; model will be loaded lazily.")

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.sample_rate = settings.tts_sample_rate
        self.channels = settings.tts_channels
        self.sample_width = settings.tts_sample_width

    def load_model(self):
        if self.model_loaded:
            return self.model
        try:
            if Continue1Model is None:
                raise RuntimeError("continue_tts is not installed. Install with: pip install continue-tts")
            logger.info("Loading Continue-TTS model...")
            self.model = Continue1Model(
                model_name=settings.tts_model_name,
                max_model_len=2048,
                trust_remote_code=True
            )
            self.model_loaded = True
            logger.info("✅ Continue-TTS model loaded successfully!")
            return self.model
        except Exception as e:
            err_msg = f"{e}"
            if "pynvml" in err_msg or "nvmlDeviceGetName" in err_msg or "UnicodeDecodeError" in err_msg:
                logger.warning("Detected NVML decode error while loading model. Retrying with CPU fallback.")
                os.environ.setdefault("VLLM_USE_NVML", "1")
                os.environ.setdefault("VLLM_SKIP_NVML", "0")
                try:
                    self.model = Continue1Model(
                        model_name=settings.tts_model_name,
                        max_model_len=2048,
                        trust_remote_code=True
                    )
                    self.model_loaded = True
                    return self.model
                except Exception as e2:
                    logger.error(f"❌ CPU fallback load also failed: {e2}")
                    raise
            logger.error(f"❌ Failed to load model: {e}")
            raise

    def _chunk_to_int16_bytes(self, chunk) -> bytes:
        if chunk is None:
            return b''
        if isinstance(chunk, torch.Tensor):
            if chunk.dtype in (torch.float32, torch.float64, torch.float16):
                arr = chunk.detach().cpu().float().numpy()
            elif chunk.dtype == torch.int16:
                arr = chunk.detach().cpu().numpy().astype(np.int16)
                return arr.tobytes()
            else:
                arr = chunk.detach().cpu().float().numpy()
        elif isinstance(chunk, np.ndarray):
            arr = chunk
        elif isinstance(chunk, (list, tuple)):
            arr = np.array(chunk, dtype=np.float32)
        elif isinstance(chunk, (bytes, bytearray)):
            handled = False
            b = bytes(chunk)
            if len(b) % 4 == 0 and len(b) >= 4:
                try:
                    farr = np.frombuffer(b, dtype=np.float32)
                    max_abs = float(np.max(np.abs(farr))) if farr.size > 0 else 0.0
                    if 0.0 <= max_abs <= 1.5:
                        arr = farr
                        handled = True
                except:
                    pass
            if not handled:
                if len(b) % 2 == 0:
                    return b
                return b
        else:
            return b''

        if arr.ndim > 1:
            arr = arr.reshape(-1)
        if arr.dtype.kind == 'f':
            np.clip(arr, -1.0, 1.0, out=arr)
            return (arr * 32767.0).astype(np.int16).tobytes()
        if arr.dtype == np.int16:
            return arr.tobytes()
        try:
            return arr.astype(np.int16).tobytes()
        except Exception:
            return b''

    def _combine_chunks_to_pcm(self, chunks) -> bytes:
        pcm_buffers = []
        for ch in chunks:
            b = self._chunk_to_int16_bytes(ch)
            if b:
                pcm_buffers.append(b)
        return b''.join(pcm_buffers)

    def generate_speech_wav(self, text: str, voice: str) -> io.BytesIO:
        if not self.model_loaded:
            self.load_model()
            
        audio_chunks = self.model.generate_speech(
            prompt=text,
            voice=voice,
            temperature=0.6,
            top_p=0.8,
            max_tokens=1200,
            repetition_penalty=1.3
        )
        
        if not isinstance(audio_chunks, (list, tuple)):
            audio_chunks = list(audio_chunks)
            
        audio_data = self._combine_chunks_to_pcm(audio_chunks)
        if not audio_data:
            raise ValueError("Empty audio output from model")
            
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.sample_width)
            wf.setframerate(self.sample_rate)
            wf.writeframes(audio_data)
        
        wav_buffer.seek(0)
        return wav_buffer

tts_service = TTSService()
