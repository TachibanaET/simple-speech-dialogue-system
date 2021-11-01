FROM pytorch/pytorch:1.7.1-cuda11.0-cudnn8-devel
SHELL ["/bin/bash", "-c"]

WORKDIR /workspace/source

ARG HTTP_PROXY
ENV http_proxy ${HTTP_PROXY}
ENV https_proxy ${HTTP_PROXY}

RUN apt update && apt -y upgrade

RUN apt -y install  vim \
  wget \
  curl \
  git \
  gcc \
  cmake \
  sox \
  libsndfile1-dev \
  ffmpeg \
  flac \
  unzip \
  vim \
  tmux 

ADD requirements.txt /workspace/source
RUN pip3 install -r requirements.txt

ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES utility,compute

CMD ["uvicorn", "index:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]