const inputText = document.getElementById('inputText');
const langSelect = document.getElementById('langSelect');
const levelSelect = document.getElementById('levelSelect');
const runBtn = document.getElementById('runBtn');
const output = document.getElementById('output');

const API_KEY = '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';

runBtn.addEventListener('click', async () => {

    const text = inputText.value.trim();
    const lang = langSelect.value;
    const level = levelSelect.value;

    if (!text) {
        output.innerText = 'Please enter some content first!';
        return;
    }

    runBtn.disabled = true;
    runBtn.innerText = 'Processing...';
    output.innerText = 'AI is thinking...';

    const prompt = `You are an AI-Powered Content Localization Engine.

Process this input through 4 layers:
Layer 1 - Understand: Find the core meaning.
Layer 2 - Simplify: Adjust for ${level} level.
Layer 3 - Cultural Localization: Use Indian examples (Tata, Reliance, Rupees, Cricket etc.)
Layer 4 - Translate: Output the final content in ${lang}.

Reply in this format:
ENGLISH VERSION:
[simplified English with Indian examples]

${lang} VERSION:
[translated version]

Input text: "${text}"`;

    let result = '';

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'google/gemma-3-4b-it:free',
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        const data = await response.json();
        result = data.choices[0].message.content;
        output.innerText = result;

    } catch (error) {
        output.innerText = 'Something went wrong. Please try again.';
    }

    runBtn.disabled = false;
    runBtn.innerText = '⚡ Execute Localization Engine';

    if (result) {
        saveToHistory(text, lang, level, result);
    }

    const speakBtn = document.getElementById('speakBtn');
    speakBtn.style.display = 'block';
    speakBtn.onclick = () => {
        const text = document.getElementById('output').innerText;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            if (speakBtn.innerText.includes('LISTEN')) {
                window.speechSynthesis.speak(utterance);
                speakBtn.innerText = '⏹ STOP LISTENING';
                utterance.onend = () => {
                    speakBtn.innerText = '🔊 LISTEN TO OUTPUT';
                };
            } else {
                window.speechSynthesis.cancel();
                speakBtn.innerText = '🔊 LISTEN TO OUTPUT';
            }
        } else {
            alert('Sorry! Your browser does not support Text-to-Speech.');
        }
    };

    const copyBtn = document.getElementById('copyBtn');
    copyBtn.style.display = 'block';
    copyBtn.onclick = () => {
        const text = document.getElementById('output').innerText;
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.innerText = '✅';
            setTimeout(() => {
                copyBtn.innerText = '📋';
            }, 2000);
        }).catch(() => {
            copyBtn.innerText = '❌';
            setTimeout(() => {
                copyBtn.innerText = '📋';
            }, 2000);
        });
    };

});

function saveToHistory(input, lang, level, output) {
    const historyCard = document.getElementById('historyCard');
    const historyList = document.getElementById('historyList');

    historyCard.style.display = 'block';

    const time = new Date().toLocaleTimeString();

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
    <div class="history-item-top">
      <span class="history-lang">${lang} · ${level}</span>
      <span class="history-time">${time}</span>
    </div>
    <div class="history-preview">${input.substring(0, 80)}...</div>
  `;

    item.onclick = () => {
        document.getElementById('output').innerText = output;
        document.getElementById('inputText').value = input;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    historyList.insertBefore(item, historyList.firstChild);

    if (!document.getElementById('clearBtn')) {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearBtn';
        clearBtn.className = 'clear-btn';
        clearBtn.innerText = '🗑 Clear History';
        clearBtn.onclick = () => {
            historyList.innerHTML = '';
            historyCard.style.display = 'none';
        };
        historyList.after(clearBtn);
    }
}