import soundfile as sf
from fastapi import FastAPI
import json
import base64
import io
import wave
import sys
from pydantic import BaseModel  # リクエストbodyを定義するために必要
from typing import List  # ネストされたBodyを定義するために必要
from scipy.io.wavfile import write
import librosa


from utility import asr , generate, tts
# sys.path.append('/workspace/source')
speech2text = asr.get_speech2text()
generate_model = generate.get_model()


# リクエストbodyを定義
class WavInfo(BaseModel):
    index: int
    audio_data: str

class DialogueInfo(BaseModel):
    user_text : str

class SpeechGenInfo(BaseModel):
    model_name : str
    text : str

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/send_audio_data")
def send_audio_data(wav_info: WavInfo):
    # return wav_info

    audio_data = wav_info.audio_data

    # データをBase64デコード
    audio_dec = base64.b64decode(audio_data)

    # Bytesオブジェクト生成
    audio_bin = io.BytesIO(audio_dec)

    # wav, fs = sf.read(audio_bin)
    wav, sr = librosa.load(audio_bin, sr=16000)

    # wav, fs = sf.read("Laboro_sample.wav")
    text, token, *_ = speech2text(wav)[0]

    print(text)
    return {
        "speech_text" : text
        } 

@app.post("/get_system_text")
def get_system_text(dialogue_info: DialogueInfo):
    # return wav_info

    user_text = dialogue_info.user_text
    context = f'<USER>{user_text}<SYSTEM>'
    sys_text = generate.generate_system_text(generate_model, context)[0]
    print(sys_text)

    return {
        "user_text" : user_text,
        "system_text" : sys_text
        } 

@app.post("/get_speech")
def get_speech(text_info: SpeechGenInfo):
    if text_info.model_name == '':
        text2speech = tts.get_text2speech()
    else:
        text2speech = tts.get_text2speech(text_info.model_name)
    
    speech, *_ = text2speech(text_info.text)

    # print(speech.numpy().shape)

    # enc=base64.b64encode(speech.numpy())

    # print(enc)

    tmp = io.BytesIO()
    # with io.BytesIO() as fio:
    
    #     sf.write(fio, speech.numpy(), samplerate=text2speech.fs, format="wav")
    #     audio_string = fio.getvalue()
    sf.write(tmp, speech.numpy(), samplerate=text2speech.fs, format="wav")
    content = bytes(tmp.getbuffer())
    # print(content)
    enc=base64.b64encode(content)
    # print(enc)
    # print(tmp)
    # # return wav_info

    # audio_data = wav_info.audio_data

    # # データをBase64デコード
    # audio_dec = base64.b64decode(audio_data)

    # # Bytesオブジェクト生成
    # audio_bin = io.BytesIO(audio_dec)

    # # wav, fs = sf.read(audio_bin)
    # wav, sr = librosa.load(audio_bin, sr=16000)

    # # wav, fs = sf.read("Laboro_sample.wav")
    # text, token, *_ = speech2text(wav)[0]

    # print(text)
    return {
        "speech" : enc
        } 