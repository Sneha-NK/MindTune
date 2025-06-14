// Virtual Clone JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize variables
    let faceLandmarksModel = null;
    let videoStream = null;
    let cloneData = null;
    let isProcessing = false;

    // Get DOM elements
    const webcam = document.getElementById('webcam');
    const canvas = document.getElementById('avatar-canvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const createCloneBtn = document.getElementById('createCloneBtn');
    const cloneInteraction = document.querySelector('.clone-interaction');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const voiceInputBtn = document.getElementById('voiceInputBtn');

    // Initialize face landmarks detection
    async function initializeFaceDetection() {
        try {
            faceLandmarksModel = await faceLandmarksDetection.load(
                faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
            );
            console.log('Face detection model loaded');
        } catch (error) {
            console.error('Error loading face detection model:', error);
        }
    }

    // Initialize webcam
    async function initializeWebcam() {
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });
            webcam.srcObject = videoStream;
            await webcam.play();
            console.log('Webcam initialized');
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Please allow camera access to create your virtual clone.');
        }
    }

    // Capture photo
    async function capturePhoto() {
        if (!videoStream || isProcessing) return;

        isProcessing = true;
        captureBtn.disabled = true;
        
        try {
            // Draw video frame to canvas
            const context = canvas.getContext('2d');
            canvas.width = webcam.videoWidth;
            canvas.height = webcam.videoHeight;
            context.drawImage(webcam, 0, 0);

            // Detect face landmarks
            const faces = await detectFaceLandmarks();
            if (faces && faces.length > 0) {
                // Process face landmarks and create avatar
                await processAvatar(faces[0]);
                
                // Show retake button and hide capture button
                captureBtn.style.display = 'none';
                retakeBtn.style.display = 'block';
                
                // Stop webcam stream
                stopWebcam();
            } else {
                alert('No face detected. Please ensure your face is clearly visible.');
                isProcessing = false;
                captureBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error capturing photo:', error);
            alert('Error capturing photo. Please try again.');
            isProcessing = false;
            captureBtn.disabled = false;
        }
    }

    // Detect face landmarks
    async function detectFaceLandmarks() {
        if (!faceLandmarksModel) return null;

        const predictions = await faceLandmarksModel.estimateFaces({
            input: canvas
        });
        return predictions;
    }

    // Process avatar
    async function processAvatar(faceLandmarks) {
        // Here you would implement avatar creation based on face landmarks
        // For now, we'll just use the captured photo
        const avatarImage = canvas.toDataURL('image/png');
        document.querySelector('.clone-avatar').style.backgroundImage = `url(${avatarImage})`;
        document.querySelector('.clone-avatar').style.backgroundSize = 'cover';
    }

    // Stop webcam
    function stopWebcam() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
    }

    // Create virtual clone
    async function createVirtualClone() {
        const cloneName = document.getElementById('cloneName').value;
        const voiceType = document.getElementById('voiceType').value;
        const interests = document.getElementById('interests').value;
        const expertise = document.getElementById('expertise').value;
        const background = document.getElementById('background').value;

        // Get personality traits
        const traits = {};
        document.querySelectorAll('.trait-slider input').forEach(slider => {
            traits[slider.previousElementSibling.textContent.toLowerCase()] = slider.value;
        });

        // Create clone data object
        cloneData = {
            name: cloneName,
            voiceType,
            interests: interests.split(',').map(i => i.trim()),
            expertise: expertise.split(',').map(e => e.trim()),
            background,
            personality: traits,
            avatar: document.querySelector('.clone-avatar').style.backgroundImage
        };

        // Show interaction section
        document.querySelector('.clone-creation').style.display = 'none';
        cloneInteraction.style.display = 'block';
        cloneInteraction.classList.add('fade-in');

        // Add welcome message
        addMessage('clone', `Hello! I'm ${cloneName}, your virtual clone. How can I help you today?`);
    }

    // Add message to chat
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message fade-in`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage('user', message);
        messageInput.value = '';

        // Generate clone response
        const response = await generateCloneResponse(message);
        addMessage('clone', response);
    }

    // Generate clone response
    async function generateCloneResponse(message) {
        // Here you would implement AI response generation
        // For now, we'll return a simple response
        const responses = [
            "That's interesting! Tell me more.",
            "I understand what you mean.",
            "Based on my personality traits, I think...",
            "Let me share my perspective on that.",
            "I'm curious to hear your thoughts on this."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Voice input handling
    let isRecording = false;
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        messageInput.value = text;
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        isRecording = false;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        isRecording = false;
    };

    // Event listeners
    captureBtn.addEventListener('click', capturePhoto);
    retakeBtn.addEventListener('click', () => {
        retakeBtn.style.display = 'none';
        captureBtn.style.display = 'block';
        captureBtn.disabled = false;
        isProcessing = false;
        initializeWebcam();
    });

    createCloneBtn.addEventListener('click', createVirtualClone);

    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    voiceInputBtn.addEventListener('click', () => {
        if (!isRecording) {
            recognition.start();
            voiceInputBtn.innerHTML = '<i class="fas fa-stop"></i>';
            isRecording = true;
        } else {
            recognition.stop();
            voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            isRecording = false;
        }
    });

    // Initialize
    await initializeFaceDetection();
    await initializeWebcam();
}); 