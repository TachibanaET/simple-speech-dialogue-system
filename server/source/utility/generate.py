# edit base : https://github.com/huggingface/transformers/blob/master/examples/text-generation/run_generation.py

import argparse
import logging

import numpy as np
import torch

from transformers import (
    GPT2LMHeadModel,
    GPT2Tokenizer,
    T5Tokenizer,
)

MAX_LENGTH = int(10000)  # Hardcoded max length to avoid infinite loop

h_params = {
    'model_path' : '/workspace/source/models/gpt2/best-loss/checkpoint-500000',
    # 'model_path' : 'rinna/japanese-gpt2-medium',
    'length' : 40,
    'stop_token' : '</s>',
    'temperature' : 1.0,
    'k' : 0,
    'p' : 0.9,
    'num_return_sequences' : 1,
    'repetition_penalty' : 1.0,
    'device' : torch.device("cuda" if torch.cuda.is_available() else "cpu"),


}

tokenizer = T5Tokenizer.from_pretrained(h_params['model_path'])

def adjust_length_to_model(length, max_sequence_length):
    if length < 0 and max_sequence_length > 0:
        length = max_sequence_length
    elif 0 < max_sequence_length < length:
        length = max_sequence_length  # No generation bigger than model size
    elif length < 0:
        length = MAX_LENGTH  # avoid infinite loop
    return length

def get_model():
    model = GPT2LMHeadModel.from_pretrained(h_params['model_path'])
    model.to(h_params['device'])
    h_params['length'] = adjust_length_to_model(h_params['length'], max_sequence_length=model.config.max_position_embeddings)
    return model

def generate_system_text(model, context):
    encoded_text = tokenizer.encode(context, add_special_tokens=False, return_tensors="pt")
    encoded_text = encoded_text.to(h_params['device'])
    input_ids = encoded_text

    output_sequences = model.generate(
        input_ids=input_ids,
        max_length=h_params['length'] + len(input_ids[0]),
        temperature=h_params['temperature'],
        top_k=h_params['k'],
        top_p=h_params['p'],
        repetition_penalty=h_params['repetition_penalty'],
        do_sample=True,
        num_return_sequences=h_params['num_return_sequences'],
    )

    # Remove the batch dimension when returning multiple sequences
    if len(output_sequences.shape) > 2:
        output_sequences.squeeze_()

    generated_sequences = []

    for generated_sequence_idx, generated_sequence in enumerate(output_sequences):
        print(f"=== GENERATED SEQUENCE {generated_sequence_idx + 1} ===")
        generated_sequence = generated_sequence.tolist()

        # Decode text
        text = tokenizer.decode(generated_sequence, clean_up_tokenization_spaces=True)

        # Remove all text after the stop token
        text = text[: text.find(h_params['stop_token']) if h_params['stop_token'] else None]

        gen = text[len(tokenizer.decode(input_ids[0], clean_up_tokenization_spaces=True)) :]

        # Add the prompt at the beginning of the sequence. Remove the excess text that was used for pre-processing
        total_sequence = (
            context + gen
        )

        generated_sequences.append(gen)
        print(total_sequence)

    return generated_sequences




if __name__ == "__main__":
    context = '<USER>こんにちは<SYSTEM>'

    model = get_model()

    gens = generate_system_text(model, context)
    # print(gens)

