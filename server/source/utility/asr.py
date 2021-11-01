import soundfile as sf
from espnet_model_zoo.downloader import ModelDownloader
from espnet2.bin.asr_inference import Speech2Text, main
import pprint

import sys

def get_speech2text():
    d = ModelDownloader()
    speech2text = Speech2Text(
        # Specify task and corpus
        # **d.download_and_unpack(task="asr", corpus="librispeech")
        **d.download_and_unpack("Shinji Watanabe/laborotv_asr_train_asr_conformer2_latest33_raw_char_sp_valid.acc.ave"),
        device='cuda'
    )
    return speech2text
