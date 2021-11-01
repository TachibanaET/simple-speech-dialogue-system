import soundfile
from espnet_model_zoo.downloader import ModelDownloader
from espnet2.bin.tts_inference import Text2Speech

def get_text2speech(model_name='kan-bayashi/jsut_tts_train_tacotron2_raw_phn_jaconv_pyopenjtalk_train.loss.best'):
    d = ModelDownloader()
    text2speech = Text2Speech(
        **d.download_and_unpack(model_name),
        device='cuda'
    )
    return text2speech