// AI Features JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing AI features...');
    setupCameraHandlers();
    await initializeFaceDetector();
    setupTextAnalysis();
});

// Global variables for camera handling
let stream = null;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const errorMsg = document.getElementById('error');
const resultContainer = document.getElementById('recognition-result');

function setupCameraHandlers() {
    // Add click handlers for camera buttons
    startCameraBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', captureImage);
    retakeBtn.addEventListener('click', retakeImage);
}

async function startCamera() {
    try {
        // Check for camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera API is not supported in your browser');
        }

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        });

        // Set up video stream
        video.srcObject = stream;
        await video.play();

        // Show success message and update UI
        errorMsg.textContent = '';
        resultContainer.innerHTML = '<p class="success">Camera started successfully!</p>';
        
        // Show capture button and hide start button
        startCameraBtn.style.display = 'none';
        captureBtn.style.display = 'block';

    } catch (error) {
        console.error('Camera error:', error);
        let message = 'Error accessing camera: ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            message += 'Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            message += 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
            message += 'Camera is in use by another application.';
        } else {
            message += error.message;
        }
        
        errorMsg.textContent = message;
    }
}

function captureImage() {
    if (!stream) {
        errorMsg.textContent = 'Camera is not started. Please start the camera first.';
        return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop the camera
    stopCamera();

    // Update UI
    video.style.display = 'none';
    canvas.style.display = 'block';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'block';
    startCameraBtn.style.display = 'block';

    // Start comprehensive analysis
    startComprehensiveAnalysis(canvas);
}

function retakeImage() {
    // Reset UI
    video.style.display = 'block';
    canvas.style.display = 'none';
    captureBtn.style.display = 'block';
    retakeBtn.style.display = 'none';
    resultContainer.innerHTML = '<p>Ready to capture</p>';
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
    }
}

let emotionChart;

async function detectEmotions(imageElement) {
    resultContainer.innerHTML = '<p>Analyzing your emotions...</p>';
    
    try {
        // Generate dynamic emotion values based on random facial expressions
        // In a real implementation, these would be based on actual facial analysis
        const baseEmotions = {
            happy: getRandomWithBias(0, 100, isSmiling() ? 0.8 : 0.2),
            sad: getRandomWithBias(0, 100, isSmiling() ? 0.2 : 0.6),
            neutral: getRandomWithBias(0, 100, 0.5),
            surprised: getRandomWithBias(0, 100, hasWidenedEyes() ? 0.7 : 0.3),
            angry: getRandomWithBias(0, 100, hasFurrowed() ? 0.8 : 0.2),
            excited: getRandomWithBias(0, 100, isSmiling() ? 0.7 : 0.3),
            anxious: getRandomWithBias(0, 100, 0.4),
            content: getRandomWithBias(0, 100, isSmiling() ? 0.6 : 0.4)
        };

        // Normalize values to ensure they sum to a reasonable range
        const totalEmotion = Object.values(baseEmotions).reduce((a, b) => a + b, 0);
        const emotions = {};
        for (const [emotion, value] of Object.entries(baseEmotions)) {
            emotions[emotion] = (value / totalEmotion) * 400; // Scale to make primary emotions more prominent
        }

        // Sort emotions by intensity
        const sortedEmotions = Object.entries(emotions)
            .sort(([,a], [,b]) => b - a);
        
        const emotionDisplay = sortedEmotions.map(([emotion, intensity]) => {
            const emoji = getEmotionEmoji(emotion);
            const percentage = Math.round(intensity);
            return `
                <div class="emotion-item ${emotion.toLowerCase()}">
                    <div class="emotion-emoji-container">
                        <span class="emotion-emoji large">${emoji}</span>
                    </div>
                    <div class="emotion-details">
                        <span class="emotion-name">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
                        <div class="emotion-bar">
                            <div class="emotion-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                            <span class="emotion-percentage">${percentage}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        resultContainer.innerHTML = `
            <div class="analysis-result">
                <div class="emotions-grid">
                    ${emotionDisplay}
                </div>
                <div class="dominant-emotion">
                    <h4>Primary Emotion</h4>
                    <div class="emotion-highlight">
                        <span class="emotion-emoji extra-large">${getEmotionEmoji(sortedEmotions[0][0])}</span>
                        <p>${sortedEmotions[0][0].charAt(0).toUpperCase() + sortedEmotions[0][0].slice(1)}</p>
                        <p class="emotion-percentage">${Math.round(sortedEmotions[0][1])}%</p>
                    </div>
                    <p class="emotion-explanation">${getEmotionExplanation(sortedEmotions[0][0], sortedEmotions[0][1])}</p>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error in emotion detection:', error);
        resultContainer.innerHTML = `
            <div class="analysis-result">
                <p>Please ensure your face is clearly visible and try again.</p>
                <button onclick="retakeImage()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

// Helper functions for facial analysis simulation
function getRandomWithBias(min, max, bias) {
    // Generate a random number with bias towards higher or lower values
    const random = Math.random();
    const weighted = Math.pow(random, bias); // Bias the distribution
    return min + (weighted * (max - min));
}

function isSmiling() {
    // Simulate smile detection with random bias
    return Math.random() > 0.4; // 60% chance of detecting a smile
}

function hasWidenedEyes() {
    // Simulate widened eyes detection
    return Math.random() > 0.7; // 30% chance of detecting widened eyes
}

function hasFurrowed() {
    // Simulate furrowed brow detection
    return Math.random() > 0.8; // 20% chance of detecting furrowed brow
}

// Update the emotion explanations to be more dynamic
function getEmotionExplanation(emotion, intensity) {
    const explanations = {
        happy: [
            'A slight smile detected! 😊 Keep that positive energy!',
            'Your happiness is clearly visible! 🌟 What a great mood!',
            'Radiating joy! ✨ Your smile is contagious!'
        ],
        sad: [
            'I notice a hint of sadness 😢 It\'s okay to feel this way',
            'Some signs of sadness detected 💙 Take a moment for yourself',
            'Strong signs of sadness present 🫂 Consider talking to someone'
        ],
        neutral: [
            'Maintaining a balanced expression 😐 Staying composed',
            'Very neutral emotional state 🧘 Good for clear thinking',
            'Exceptionally calm and collected 😌 Perfect for decision making'
        ],
        surprised: [
            'Slight surprise in your expression! 😮',
            'Clearly surprised! 🤯 Something unexpected?',
            'Very strong surprise detected! 😲 Quite the revelation!'
        ],
        angry: [
            'Minor tension detected 😠 Take a deep breath',
            'Clear signs of frustration 😤 Try to stay calm',
            'Strong anger indicators 😡 Consider taking a break'
        ],
        excited: [
            'A spark of excitement! 🤩',
            'Clearly energized and excited! ⚡',
            'Bursting with enthusiasm! 🎉'
        ],
        anxious: [
            'Slight signs of anxiety 😰 Try some deep breaths',
            'Noticeable anxiety present 😥 Consider a calming activity',
            'Strong anxiety indicators 😨 Take a moment to center yourself'
        ],
        content: [
            'Subtle contentment showing 😌',
            'Clear signs of satisfaction 😊',
            'Deep sense of contentment detected 🥰'
        ]
    };
    
    const explanationList = explanations[emotion] || ['Analyzing your expression... 🤔'];
    const index = Math.floor(intensity / 34);
    return explanationList[Math.min(index, explanationList.length - 1)];
}

function updateEmotionChart(emotions) {
    const ctx = document.getElementById('emotionChart').getContext('2d');
    
    if (emotionChart) {
        emotionChart.destroy();
    }
    
    emotionChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(emotions),
            datasets: [{
                label: 'Emotion Intensity',
                data: Object.values(emotions),
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                borderColor: 'rgba(74, 144, 226, 1)',
                pointBackgroundColor: 'rgba(74, 144, 226, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function displayEmotionCards(emotions) {
    const sortedEmotions = Object.entries(emotions)
        .sort(([,a], [,b]) => b - a);
    
    const primaryEmotion = sortedEmotions[0];
    const secondaryEmotion = sortedEmotions[1];
    
    updateEmotionCard('primary-emotion', primaryEmotion[0], primaryEmotion[1]);
    updateEmotionCard('secondary-emotion', secondaryEmotion[0], secondaryEmotion[1]);
}

function updateEmotionCard(cardId, emotion, intensity) {
    const card = document.getElementById(cardId);
    const emoji = getEmotionEmoji(emotion);
    const explanation = getEmotionExplanation(emotion, intensity);
    
    card.querySelector('.emotion-emoji').textContent = emoji;
    card.querySelector('.emotion-percentage').textContent = `${Math.round(intensity)}%`;
    card.querySelector('.emotion-explanation').textContent = explanation;
}

function getEmotionEmoji(emotion) {
    const emojis = {
        happy: '😊',
        sad: '😢',
        neutral: '😐',
        surprised: '😮',
        angry: '😠',
        joyful: '😄',
        excited: '🤩',
        anxious: '😰',
        fearful: '😨',
        disgusted: '🤢',
        confused: '🤔',
        content: '😌',
        tired: '😴',
        bored: '🥱',
        loving: '🥰'
    };
    return emojis[emotion.toLowerCase()] || '🤔';
}

// Text Analysis
function setupTextAnalysis() {
    const textInput = document.getElementById('textInput');
    const analyzeTextBtn = document.getElementById('analyzeTextBtn');
    const textAnalysisResult = document.getElementById('textAnalysisResult');

    if (!textInput || !analyzeTextBtn || !textAnalysisResult) {
        console.error('Text analysis elements not found');
        return;
    }

    // Clear any previous event listeners
    analyzeTextBtn.replaceWith(analyzeTextBtn.cloneNode(true));
    const newAnalyzeTextBtn = document.getElementById('analyzeTextBtn');

    newAnalyzeTextBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text) {
            analyzeText(text);
        } else {
            textAnalysisResult.innerHTML = '<p class="error">Please enter some text to analyze.</p>';
        }
    });

    // Add input event listener to enable/disable button
    textInput.addEventListener('input', () => {
        newAnalyzeTextBtn.disabled = !textInput.value.trim();
    });

    // Initialize button state
    newAnalyzeTextBtn.disabled = !textInput.value.trim();
    
    // Add placeholder text
    textInput.placeholder = "Type your thoughts here... (e.g., 'I'm feeling excited about this project!')";
    
    // Show initial message
    textAnalysisResult.innerHTML = '<p>Enter your text and click "Analyze Text" to begin.</p>';
}

async function analyzeText(text) {
    const resultContainer = document.getElementById('textAnalysisResult');
    if (!resultContainer) return;

    resultContainer.innerHTML = '<p>Analyzing text...</p>';
    
    try {
        // Simulate text analysis
        const sentiment = Math.random();
        const emotions = {
            joy: Math.random(),
            sadness: Math.random(),
            anxiety: Math.random(),
            confidence: Math.random()
        };
        
        // Create speech synthesis for feedback
        const message = new SpeechSynthesisUtterance();
        message.lang = 'en-US';
        message.volume = 1;
        message.rate = 1;
        message.pitch = 1;
        
        // Generate feedback message
        const feedback = generateTextFeedback(sentiment, emotions);
        message.text = feedback;
        
        // Display results and speak feedback
        displayTextAnalysis(sentiment, emotions, feedback);
        window.speechSynthesis.speak(message);
        
    } catch (error) {
        console.error('Error analyzing text:', error);
        resultContainer.innerHTML = '<p class="error">Error analyzing text. Please try again.</p>';
    }
}

function getSentimentDescription(sentiment) {
    if (sentiment > 0.7) return 'Very Positive';
    if (sentiment > 0.5) return 'Positive';
    if (sentiment > 0.3) return 'Neutral';
    if (sentiment > 0.1) return 'Negative';
    return 'Very Negative';
}

function generateTextFeedback(sentiment, emotions) {
    let feedback = '';
    
    // Add sentiment feedback
    if (sentiment > 0.7) {
        feedback += "I sense very positive energy in your words! ";
    } else if (sentiment > 0.5) {
        feedback += "Your text shows positive emotions. ";
    } else if (sentiment > 0.3) {
        feedback += "Your message seems neutral in tone. ";
    } else if (sentiment > 0.1) {
        feedback += "I detect some negative emotions in your text. ";
    } else {
        feedback += "Your message carries strong negative emotions. ";
    }

    // Add emotion-specific feedback
    const dominantEmotion = Object.entries(emotions)
        .sort(([,a], [,b]) => b - a)[0];
    
    switch(dominantEmotion[0]) {
        case 'joy':
            feedback += "Your joy and enthusiasm really shine through! ";
            break;
        case 'sadness':
            feedback += "I can sense some sadness in your words. Remember, it's okay to feel this way. ";
            break;
        case 'anxiety':
            feedback += "There seems to be some anxiety in your message. Take a deep breath. ";
            break;
        case 'confidence':
            feedback += "Your words show strong confidence. Keep that spirit! ";
            break;
    }

    return feedback;
}

function displayTextAnalysis(sentiment, emotions, feedback) {
    const resultContainer = document.getElementById('textAnalysisResult');
    if (!resultContainer) return;

    const sentimentText = getSentimentDescription(sentiment);
    const emotionsList = Object.entries(emotions)
        .sort(([,a], [,b]) => b - a)
        .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(1)}%`)
        .join('<br>');
    
    resultContainer.innerHTML = `
        <div class="analysis-result">
            <p><strong>Overall Sentiment:</strong> ${sentimentText}</p>
            <p><strong>Detected Emotions:</strong><br>${emotionsList}</p>
            <div class="feedback-message">
                <p><strong>AI Feedback:</strong></p>
                <p><i>${feedback}</i></p>
                <button onclick="speakFeedback(this)" class="speak-btn" data-feedback="${feedback}">
                    🔊 Listen to Feedback
                </button>
            </div>
        </div>
    `;
}

// Voice Analysis
let mediaRecorder;
let audioChunks = [];
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');

startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopRecording);

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = analyzeVoice;
        
        audioChunks = [];
        mediaRecorder.start();
        
        // Speak start message
        const startMessage = new SpeechSynthesisUtterance("Recording started. Please speak naturally.");
        window.speechSynthesis.speak(startMessage);
        
        startRecordingBtn.style.display = 'none';
        stopRecordingBtn.style.display = 'block';
    } catch (error) {
        console.error('Error accessing microphone:', error);
        document.getElementById('voiceAnalysisResult').innerHTML = 
            '<p class="error">Error accessing microphone. Please make sure you have granted microphone permissions.</p>';
    }
}

function stopRecording() {
    mediaRecorder.stop();
    startRecordingBtn.style.display = 'block';
    stopRecordingBtn.style.display = 'none';
    
    // Speak stop message
    const stopMessage = new SpeechSynthesisUtterance("Recording stopped. Analyzing your voice...");
    window.speechSynthesis.speak(stopMessage);
}

function analyzeVoice() {
    const resultContainer = document.getElementById('voiceAnalysisResult');
    resultContainer.innerHTML = '<p>Analyzing voice...</p>';
    
    // Simulate voice analysis
    setTimeout(() => {
        const emotions = {
            confidence: Math.random() * 100,
            stress: Math.random() * 100,
            energy: Math.random() * 100,
            clarity: Math.random() * 100,
            engagement: Math.random() * 100
        };
        
        const feedback = generateVoiceFeedback(emotions);
        displayVoiceAnalysis(emotions, feedback);
        
        // Speak analysis results
        const message = new SpeechSynthesisUtterance(feedback);
        window.speechSynthesis.speak(message);
    }, 1500);
}

function generateVoiceFeedback(emotions) {
    let feedback = "Based on my analysis, ";
    
    if (emotions.confidence > 70) {
        feedback += "your voice shows strong confidence. ";
    } else if (emotions.confidence < 30) {
        feedback += "you might want to work on speaking more confidently. ";
    }
    
    if (emotions.stress > 70) {
        feedback += "I detect high stress levels in your voice. Try to relax. ";
    } else if (emotions.stress < 30) {
        feedback += "you sound very relaxed and calm. ";
    }
    
    if (emotions.energy > 70) {
        feedback += "Your energy level is excellent! ";
    } else if (emotions.energy < 30) {
        feedback += "Try to bring more energy to your voice. ";
    }
    
    if (emotions.clarity > 70) {
        feedback += "Your speech is very clear and articulate. ";
    } else if (emotions.clarity < 30) {
        feedback += "Consider speaking more slowly and clearly. ";
    }
    
    return feedback;
}

function displayVoiceAnalysis(emotions, feedback) {
    const resultContainer = document.getElementById('voiceAnalysisResult');
    const emotionsList = Object.entries(emotions)
        .map(([emotion, value]) => `${emotion}: ${value.toFixed(1)}%`)
        .join('<br>');
    
    resultContainer.innerHTML = `
        <div class="analysis-result">
            <p><strong>Voice Analysis Results:</strong><br>${emotionsList}</p>
            <div class="feedback-message">
                <p><strong>AI Feedback:</strong></p>
                <p><i>${feedback}</i></p>
                <button onclick="speakFeedback(this)" class="speak-btn" data-feedback="${feedback}">
                    🔊 Listen to Feedback
                </button>
            </div>
        </div>
    `;
}

// Helper function to speak feedback
function speakFeedback(button) {
    const feedback = button.getAttribute('data-feedback');
    const message = new SpeechSynthesisUtterance(feedback);
    window.speechSynthesis.speak(message);
}

// Behavior Analysis
const analyzeBehaviorBtn = document.getElementById('analyzeBehaviorBtn');
let behaviorChart;

analyzeBehaviorBtn.addEventListener('click', analyzeBehavior);

function analyzeBehavior() {
    const sliders = document.querySelectorAll('.behavior-slider');
    const scores = Array.from(sliders).map(slider => parseInt(slider.value));
    
    updateBehaviorChart(scores);
    generateRecommendations(scores);
}

function updateBehaviorChart(scores) {
    const ctx = document.getElementById('behaviorChart').getContext('2d');
    
    if (behaviorChart) {
        behaviorChart.destroy();
    }
    
    behaviorChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'Social Comfort',
                'Friendship Building',
                'Group Activity'
            ],
            datasets: [{
                label: 'Current Scores',
                data: scores,
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                borderColor: 'rgba(74, 144, 226, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
}

function generateRecommendations(scores) {
    const recommendations = document.querySelector('.behavior-recommendations');
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    let recommendationText = '<h3>Personalized Recommendations</h3>';
    
    if (avgScore < 2.5) {
        recommendationText += `
            <p>Consider these steps to improve your social interactions:</p>
            <ul>
                <li>Start with small group activities in comfortable settings</li>
                <li>Practice active listening and engagement</li>
                <li>Set small, achievable social goals</li>
            </ul>
        `;
    } else if (avgScore < 4) {
        recommendationText += `
            <p>You're making good progress! Here's how to continue improving:</p>
            <ul>
                <li>Join social groups aligned with your interests</li>
                <li>Take initiative in organizing social activities</li>
                <li>Practice expressing yourself in group settings</li>
            </ul>
        `;
    } else {
        recommendationText += `
            <p>You're doing great! Here's how to maintain and enhance your social skills:</p>
            <ul>
                <li>Mentor others in social skill development</li>
                <li>Explore leadership roles in group activities</li>
                <li>Share your experiences and strategies with others</li>
            </ul>
        `;
    }
    
    recommendations.innerHTML = recommendationText;
}

// Real-time Emotion Tracking
let isTracking = false;
const startTrackingBtn = document.getElementById('startTrackingBtn');
const stopTrackingBtn = document.getElementById('stopTrackingBtn');
const trackingResult = document.getElementById('trackingResult');
let trackingInterval;

if (startTrackingBtn && stopTrackingBtn) {
    startTrackingBtn.addEventListener('click', startEmotionTracking);
    stopTrackingBtn.addEventListener('click', stopEmotionTracking);
}

async function startEmotionTracking() {
    if (!stream) {
        await startCamera();
    }

    isTracking = true;
    startTrackingBtn.style.display = 'none';
    stopTrackingBtn.style.display = 'block';
    trackingResult.innerHTML = '<p>Starting real-time emotion tracking...</p>';

    // Track emotions every 2 seconds
    trackingInterval = setInterval(async () => {
        if (isTracking && video.readyState === 4) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            tempCanvas.getContext('2d').drawImage(video, 0, 0);
            await detectEmotions(tempCanvas);
        }
    }, 2000);
}

function stopEmotionTracking() {
    isTracking = false;
    clearInterval(trackingInterval);
    startTrackingBtn.style.display = 'block';
    stopTrackingBtn.style.display = 'none';
    trackingResult.innerHTML = '<p>Emotion tracking stopped</p>';
}

// Personality Insights
const personalityForm = document.getElementById('personalityForm');
const personalityResult = document.getElementById('personalityResult');

if (personalityForm) {
    personalityForm.addEventListener('submit', analyzePersonality);
}

function analyzePersonality(event) {
    event.preventDefault();
    
    const answers = new FormData(personalityForm);
    const traits = calculatePersonalityTraits(answers);
    displayPersonalityInsights(traits);
}

function calculatePersonalityTraits(answers) {
    // Simulate personality analysis based on form answers
    return {
        openness: Math.random() * 100,
        conscientiousness: Math.random() * 100,
        extraversion: Math.random() * 100,
        agreeableness: Math.random() * 100,
        neuroticism: Math.random() * 100,
        traits: [
            'Creative',
            'Analytical',
            'Social',
            'Organized',
            'Empathetic'
        ].sort(() => Math.random() - 0.5).slice(0, 3)
    };
}

function displayPersonalityInsights(traits) {
    const chartData = {
        labels: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'],
        datasets: [{
            label: 'Personality Traits',
            data: [
                traits.openness,
                traits.conscientiousness,
                traits.extraversion,
                traits.agreeableness,
                traits.neuroticism
            ],
            backgroundColor: 'rgba(74, 144, 226, 0.2)',
            borderColor: 'rgba(74, 144, 226, 1)',
            borderWidth: 1
        }]
    };

    const ctx = document.getElementById('personalityChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: chartData,
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    personalityResult.innerHTML = `
        <div class="personality-insights">
            <h3>Your Key Traits</h3>
            <ul>
                ${traits.traits.map(trait => `<li>${trait}</li>`).join('')}
            </ul>
            <div class="personality-recommendations">
                <h4>Personal Growth Recommendations</h4>
                <p>Based on your personality profile, consider:</p>
                <ul>
                    ${generatePersonalityRecommendations(traits)}
                </ul>
            </div>
        </div>
    `;
}

function generatePersonalityRecommendations(traits) {
    const recommendations = [];
    
    if (traits.openness > 70) {
        recommendations.push('Explore creative projects and new learning opportunities');
    }
    if (traits.conscientiousness > 70) {
        recommendations.push('Set structured goals and create detailed plans');
    }
    if (traits.extraversion > 70) {
        recommendations.push('Engage in group activities and social networking');
    }
    if (traits.agreeableness > 70) {
        recommendations.push('Consider roles in mentoring or community service');
    }
    if (traits.neuroticism > 70) {
        recommendations.push('Practice mindfulness and stress management techniques');
    }

    return recommendations.map(rec => `<li>${rec}</li>`).join('') ||
           '<li>Focus on balanced personal development across all areas</li>';
}

// Interaction Patterns Analysis
let interactionData = {
    timestamps: [],
    emotions: [],
    activities: []
};

function trackInteraction(type, data) {
    interactionData.timestamps.push(new Date());
    interactionData.emotions.push(data.emotion || 'neutral');
    interactionData.activities.push(type);

    if (interactionData.timestamps.length > 50) {
        // Keep only the last 50 interactions
        interactionData.timestamps.shift();
        interactionData.emotions.shift();
        interactionData.activities.shift();
    }

    updateInteractionPatterns();
}

function updateInteractionPatterns() {
    const patterns = analyzePatterns(interactionData);
    displayPatternInsights(patterns);
}

function analyzePatterns(data) {
    // Analyze interaction patterns
    const emotionFrequency = data.emotions.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
    }, {});

    const activityFrequency = data.activities.reduce((acc, activity) => {
        acc[activity] = (acc[activity] || 0) + 1;
        return acc;
    }, {});

    return {
        emotionFrequency,
        activityFrequency,
        totalInteractions: data.timestamps.length
    };
}

function displayPatternInsights(patterns) {
    const insightsContainer = document.getElementById('patternInsights');
    if (!insightsContainer) return;

    const emotionsList = Object.entries(patterns.emotionFrequency)
        .map(([emotion, count]) => {
            const percentage = (count / patterns.totalInteractions * 100).toFixed(1);
            return `<li>${emotion}: ${percentage}%</li>`;
        }).join('');

    const activitiesList = Object.entries(patterns.activityFrequency)
        .map(([activity, count]) => {
            const percentage = (count / patterns.totalInteractions * 100).toFixed(1);
            return `<li>${activity}: ${percentage}%</li>`;
        }).join('');

    insightsContainer.innerHTML = `
        <div class="pattern-analysis">
            <h3>Interaction Patterns</h3>
            <div class="patterns-grid">
                <div class="pattern-card">
                    <h4>Emotional Distribution</h4>
                    <ul>${emotionsList}</ul>
                </div>
                <div class="pattern-card">
                    <h4>Activity Distribution</h4>
                    <ul>${activitiesList}</ul>
                </div>
            </div>
            <div class="pattern-insights">
                <h4>Key Insights</h4>
                ${generatePatternInsights(patterns)}
            </div>
        </div>
    `;
}

function generatePatternInsights(patterns) {
    const insights = [];
    const totalInteractions = patterns.totalInteractions;

    // Analyze emotional patterns
    const dominantEmotion = Object.entries(patterns.emotionFrequency)
        .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantEmotion) {
        insights.push(`Your dominant emotion is "${dominantEmotion[0]}" (${(dominantEmotion[1] / totalInteractions * 100).toFixed(1)}% of interactions)`);
    }

    // Analyze activity patterns
    const dominantActivity = Object.entries(patterns.activityFrequency)
        .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantActivity) {
        insights.push(`Most frequent activity: "${dominantActivity[0]}" (${(dominantActivity[1] / totalInteractions * 100).toFixed(1)}% of interactions)`);
    }

    return insights.map(insight => `<p>${insight}</p>`).join('');
}

async function startComprehensiveAnalysis(imageElement) {
    resultContainer.innerHTML = '<p>Starting comprehensive analysis...</p>';
    
    try {
        // 1. Detect emotions
        await detectEmotions(imageElement);
        
        // 2. Analyze behavior based on facial features
        const behaviorScores = await analyzeBehaviorFromImage(imageElement);
        
        // 3. Generate comprehensive insights
        generateComprehensiveInsights(behaviorScores);
        
    } catch (error) {
        console.error('Error in comprehensive analysis:', error);
        resultContainer.innerHTML += '<p class="error">Error during analysis. Please try again.</p>';
    }
}

async function analyzeBehaviorFromImage(imageElement) {
    // Simulate behavior analysis based on facial features
    // In a real implementation, this would use ML models to analyze facial features
    const scores = {
        confidence: Math.random() * 5,
        engagement: Math.random() * 5,
        stress: Math.random() * 5,
        focus: Math.random() * 5,
        comfort: Math.random() * 5
    };

    // Update behavior chart
    updateBehaviorChart([
        scores.confidence,
        scores.engagement,
        scores.comfort
    ]);

    return scores;
}

function generateComprehensiveInsights(behaviorScores) {
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'comprehensive-insights';

    // Calculate overall state
    const avgScore = Object.values(behaviorScores).reduce((a, b) => a + b, 0) / 5;
    
    // Generate personalized insights
    const insights = [];
    
    if (behaviorScores.confidence > 3.5) {
        insights.push('You appear confident and self-assured');
    } else if (behaviorScores.confidence < 2.5) {
        insights.push('You might benefit from confidence-building exercises');
    }

    if (behaviorScores.stress > 3.5) {
        insights.push('Signs of stress detected - consider relaxation techniques');
    }

    if (behaviorScores.engagement > 3.5) {
        insights.push('You show high engagement and interest');
    }

    if (behaviorScores.focus > 3.5) {
        insights.push('Your focus levels are optimal');
    } else {
        insights.push('Consider techniques to improve concentration');
    }

    // Generate recommendations based on scores
    const recommendations = generateDetailedRecommendations(behaviorScores);

    // Update the UI with comprehensive analysis
    resultContainer.innerHTML += `
        <div class="analysis-section">
            <h3>Comprehensive Analysis Results</h3>
            <div class="behavior-scores">
                <h4>Behavior Metrics:</h4>
                <ul>
                    ${Object.entries(behaviorScores).map(([key, value]) => 
                        `<li>${key}: ${value.toFixed(1)}/5</li>`).join('')}
                </ul>
            </div>
            <div class="key-insights">
                <h4>Key Insights:</h4>
                <ul>
                    ${insights.map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
            <div class="recommendations">
                <h4>Personalized Recommendations:</h4>
                <ul>
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function generateDetailedRecommendations(scores) {
    const recommendations = [];

    // Confidence recommendations
    if (scores.confidence < 3) {
        recommendations.push('Practice positive self-talk and power poses');
        recommendations.push('Set and achieve small, progressive goals');
    }

    // Stress management
    if (scores.stress > 3) {
        recommendations.push('Incorporate deep breathing exercises into your routine');
        recommendations.push('Consider mindfulness or meditation practices');
    }

    // Engagement improvement
    if (scores.engagement < 3) {
        recommendations.push('Try to find personal connections in your activities');
        recommendations.push('Set meaningful and challenging goals');
    }

    // Focus enhancement
    if (scores.focus < 3) {
        recommendations.push('Practice concentration exercises');
        recommendations.push('Create a distraction-free environment for important tasks');
    }

    // Comfort level
    if (scores.comfort < 3) {
        recommendations.push('Start with familiar environments and gradually expand your comfort zone');
        recommendations.push('Practice relaxation techniques in challenging situations');
    }

    return recommendations.length > 0 ? recommendations : 
           ['Continue maintaining your current positive practices'];
}

async function initializeFaceDetector() {
    try {
        window.faceDetector = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
                runtime: 'mediapipe',
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
                modelType: 'short'
            }
        );
        console.log('Face detector initialized successfully');
    } catch (error) {
        console.error('Error initializing face detector:', error);
        // Silently handle the error and continue
    }
}

// Add CSS for the retry button if not already present
if (!document.getElementById('retry-button-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'retry-button-styles';
    styleSheet.textContent = `
        .retry-btn {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: #4a90e2;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .retry-btn:hover {
            background-color: #357abd;
        }
        .warning {
            color: #f39c12;
            font-weight: bold;
            margin-bottom: 1rem;
        }
    `;
    document.head.appendChild(styleSheet);
}

// Add styles for the speak button
if (!document.getElementById('speak-button-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'speak-button-styles';
    styleSheet.textContent = `
        .speak-btn {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            margin-top: 10px;
            background-color: #4a90e2;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }
        .speak-btn:hover {
            background-color: #357abd;
            transform: translateY(-1px);
        }
        .feedback-message {
            margin-top: 15px;
            padding: 15px;
            background: rgba(74, 144, 226, 0.1);
            border-radius: 8px;
        }
    `;
    document.head.appendChild(styleSheet);
}