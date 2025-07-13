document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const speechRecognitionStatus = document.getElementById('speechRecognitionStatus');
    const transcriptionText = document.getElementById('transcriptionText');
    const facialStatus = document.getElementById('facialStatus');
    const speechStatus = document.getElementById('speechStatus');
    const mouseStatus = document.getElementById('mouseStatus');
    const facialEmotion = document.getElementById('facialEmotion');
    const speechEmotion = document.getElementById('speechEmotion');
    const mouseEmotion = document.getElementById('mouseEmotion');
    const finalEmotion = document.getElementById('finalEmotion');
    const interactionArea = document.getElementById('interactionArea');
    let hoverStartTime = null;

    startBtn.addEventListener('click', () => {
        try {
            fetch('/start', { method: 'POST', body: JSON.stringify({ device: '0' }) })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        startBtn.disabled = true;
                        stopBtn.disabled = false;
                        speechRecognitionStatus.textContent = 'Listening';
                        startEventSource();
                    } else {
                        throw new Error(`Start failed: ${data.message}`);
                    }
                })
                .catch(error => {
                    console.error('Start error:', error);
                    speechRecognitionStatus.textContent = 'Error';
                });
        } catch (e) {
            console.error(`Error in start button handler: ${e}`);
        }
    });

    stopBtn.addEventListener('click', () => {
        try {
            fetch('/stop', { method: 'POST' })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        startBtn.disabled = false;
                        stopBtn.disabled = true;
                        speechRecognitionStatus.textContent = 'Not Listening';
                        transcriptionText.textContent = 'None';
                        facialStatus.textContent = 'Not Ready';
                        speechStatus.textContent = 'Not Ready';
                        mouseStatus.textContent = 'Not Ready';
                        facialEmotion.textContent = 'None';
                        speechEmotion.textContent = 'None';
                        mouseEmotion.textContent = 'None';
                        finalEmotion.textContent = 'None';
                    }
                })
                .catch(error => {
                    console.error('Stop error:', error);
                    speechRecognitionStatus.textContent = 'Error';
                });
        } catch (e) {
            console.error(`Error in stop button handler: ${e}`);
        }
    });

    interactionArea.addEventListener('click', () => {
        try {
            fetch('/mouse_activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'click' })
            }).catch(error => console.error('Click event error:', error));
        } catch (e) {
            console.error(`Error in click event: ${e}`);
        }
    });

    interactionArea.addEventListener('mouseenter', () => {
        try {
            hoverStartTime = Date.now();
        } catch (e) {
            console.error(`Error in mouseenter event: ${e}`);
        }
    });

    interactionArea.addEventListener('mouseleave', () => {
        try {
            if (hoverStartTime) {
                const duration = (Date.now() - hoverStartTime) / 1000;
                fetch('/mouse_activity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'hover', duration })
                }).catch(error => console.error('Hover error:', error));
                hoverStartTime = null;
            }
        } catch (e) {
            console.error(`Error in mouseleave event: ${e}`);
        }
    });

    function startEventSource() {
        try {
            const source = new EventSource('/stream');
            source.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    speechRecognitionStatus.textContent = data.speech_ready ? 'Listening' : 'Not Listening';
                    transcriptionText.textContent = data.transcription || 'None';
                    facialStatus.textContent = data.facial_ready ? 'Ready' : 'Not Ready';
                    speechStatus.textContent = data.speech_ready ? 'Ready' : 'Not Ready';
                    mouseStatus.textContent = data.mouse_ready ? 'Ready' : 'Not Ready';
                    facialEmotion.textContent = data.facial_emotion || 'None';
                    speechEmotion.textContent = data.speech_emotion || 'None';
                    mouseEmotion.textContent = data.mouse_emotion || 'None';
                    finalEmotion.textContent = data.final_emotion || 'None';
                } catch (e) {
                    console.error(`Error parsing event data: ${e}`);
                }
            };
            source.onerror = () => {
                try {
                    console.error('EventSource error');
                    source.close();
                    speechRecognitionStatus.textContent = 'Error';
                } catch (e) {
                    console.error(`Error in EventSource error handler: ${e}`);
                }
            };
        } catch (e) {
            console.error(`Error starting EventSource: ${e}`);
        }
    }
});