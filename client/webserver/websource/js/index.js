'use strict';

import * as post from './post.js';

const elemChatContainer = document.getElementById('chat-container');

const addChat = (context, type) => {
  const htmlSource = `
    <div class="row m-3">
      <div class="${type === 'user' ? 'offset-2' : ''} col-10 bg-light rounded-3">
        <h3>${context}</h3>
      </div>
    </div>
  `
  elemChatContainer.insertAdjacentHTML('beforeend', htmlSource);
}

window.onload = () => {
  addChat('こんにちは', 'user');
  addChat('こんにちは', 'system');
};
