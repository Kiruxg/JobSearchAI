import toast from './toast.js';

// Sample questions database
const questionTypes = {
    behavioral: [
        "Tell me about a time you faced a challenging situation at work.",
        "Describe a project you're most proud of.",
        "How do you handle conflicts with coworkers?",
        "Give an example of when you showed leadership.",
        "How do you prioritize tasks when you have multiple deadlines?"
    ],
    technical: {
        "frontend": [
            "Explain the difference between flex and grid in CSS.",
            "How does React's virtual DOM work?",
            "What are closures in JavaScript?",
            "Explain the concept of responsive design.",
            "What is event delegation?"
        ],
        "backend": [
            "Explain RESTful API principles.",
            "How do you handle database optimization?",
            "Explain the concept of middleware.",
            "What are the SOLID principles?",
            "How do you ensure API security?"
        ]
    }
};

// Initialize interview state
let currentState = {
    questions: [],
    currentIndex: 0,
    jobTitle: '',
    jobDescription: ''
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateQuestions').addEventListener('click', startInterview);
    document.getElementById('submitAnswer').addEventListener('click', submitAnswer);
    document.getElementById('nextQuestion').addEventListener('click', nextQuestion);
});

function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Force a reflow to trigger animation
    toast.offsetHeight;

    // Remove the toast after animation
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    }, 3000);

    // Log for debugging
    console.log('Toast created:', message, type);
}

function startInterview() {
    const jobTitle = document.getElementById('jobTitle').value;
    const jobDescription = document.getElementById('jobDescription').value;

    if (!jobTitle || !jobDescription) {
        showToast('Please fill in both job title and description', 'error');
        return;
    }

    // Generate questions based on job description
    currentState.questions = generateQuestions(jobTitle, jobDescription);
    currentState.jobTitle = jobTitle;
    currentState.jobDescription = jobDescription;
    currentState.currentIndex = 0;

    // Show interview interface
    document.querySelector('.mock-interview-container').style.display = 'block';
    displayCurrentQuestion();
    showToast('Interview session started! Good luck!', 'success');
}

function generateQuestions(jobTitle, jobDescription) {
    // Simple logic to mix behavioral and technical questions
    const questions = [];
    const jobType = determineJobType(jobTitle.toLowerCase());
    
    // Add 3 behavioral questions
    questions.push(...getRandomQuestions(questionTypes.behavioral, 3));
    
    // Add 2 technical questions if job type is matched
    if (jobType && questionTypes.technical[jobType]) {
        questions.push(...getRandomQuestions(questionTypes.technical[jobType], 2));
    } else {
        // Add 2 more behavioral questions if no technical questions match
        questions.push(...getRandomQuestions(questionTypes.behavioral, 2));
    }

    return questions;
}

function determineJobType(jobTitle) {
    if (jobTitle.includes('frontend') || jobTitle.includes('ui') || jobTitle.includes('web')) {
        return 'frontend';
    }
    if (jobTitle.includes('backend') || jobTitle.includes('server') || jobTitle.includes('api')) {
        return 'backend';
    }
    return null;
}

function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayCurrentQuestion() {
    const chatMessages = document.getElementById('chatMessages');
    const question = currentState.questions[currentState.currentIndex];
    
    chatMessages.innerHTML = `
        <div class="message interviewer-message">
            <strong>Interviewer:</strong> ${question}
        </div>
    `;

    document.getElementById('currentQuestion').textContent = currentState.currentIndex + 1;
    document.getElementById('totalQuestions').textContent = currentState.questions.length;
}

function submitAnswer() {
    const userAnswer = document.getElementById('userAnswer').value;
    if (!userAnswer) {
        showToast('Please provide an answer', 'error');
        return;
    }

    // Display user's answer
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `
        <div class="message user-message">
            <strong>You:</strong> ${userAnswer}
        </div>
    `;

    // Generate and display feedback
    provideFeedback(userAnswer);
    
    // Clear answer field
    document.getElementById('userAnswer').value = '';
    showToast('Answer submitted successfully', 'success');
}

function provideFeedback(answer) {
    // Show feedback container
    const feedbackContainer = document.querySelector('.feedback-container');
    feedbackContainer.style.display = 'block';

    // Simple feedback generation
    const strengths = generateStrengths(answer);
    const improvements = generateImprovements(answer);
    const sampleResponse = generateSampleResponse(currentState.questions[currentState.currentIndex]);

    // Display feedback
    document.getElementById('strengthsList').innerHTML = strengths.map(s => `<li>${s}</li>`).join('');
    document.getElementById('improvementsList').innerHTML = improvements.map(i => `<li>${i}</li>`).join('');
    document.getElementById('sampleResponse').textContent = sampleResponse;

    showToast('Feedback generated successfully', 'success');
}

function nextQuestion() {
    if (currentState.currentIndex < currentState.questions.length - 1) {
        currentState.currentIndex++;
        displayCurrentQuestion();
        document.querySelector('.feedback-container').style.display = 'none';
        document.getElementById('userAnswer').value = '';
        showToast('Moving to next question', 'info');
    } else {
        showToast('Interview session completed! Upgrade to premium for more practice questions.', 'info');
    }
}

// Helper functions for feedback generation
function generateStrengths(answer) {
    const strengths = [];
    if (answer.length > 100) strengths.push("Provided a detailed response");
    if (answer.includes("example")) strengths.push("Used specific examples");
    if (answer.includes("learned") || answer.includes("improved")) strengths.push("Showed growth mindset");
    if (answer.includes("team") || answer.includes("collaborate")) strengths.push("Demonstrated teamwork");
    if (answer.includes("result") || answer.includes("outcome")) strengths.push("Focused on results");
    return strengths.length > 0 ? strengths : ["Good attempt at answering the question"];
}

function generateImprovements(answer) {
    const improvements = [];
    if (answer.length < 100) improvements.push("Consider providing more detail");
    if (!answer.includes("example")) improvements.push("Include specific examples");
    if (!answer.includes("result") && !answer.includes("outcome")) improvements.push("Mention the outcomes or results");
    if (!answer.includes("I") || !answer.includes("my")) improvements.push("Make it more personal to showcase your experience");
    if (answer.split('.').length < 3) improvements.push("Structure your answer with multiple points");
    return improvements.length > 0 ? improvements : ["Keep practicing to improve your responses"];
}

function generateSampleResponse(question) {
    // Basic sample responses based on question type
    if (question.toLowerCase().includes("tell me about a time")) {
        return "A strong response would use the STAR method: Situation, Task, Action, Result. For example: 'In my previous role, we faced [specific situation]. I was tasked with [specific responsibility]. I approached this by [specific actions]. As a result, [specific outcome with metrics if possible].'";
    }
    if (question.toLowerCase().includes("how do you")) {
        return "A strong response would outline your approach: 'I follow a systematic process where I first [initial step], then [next step]. For example, in my previous role, I [specific example]. This approach has consistently led to [positive outcome].'";
    }
    return "A strong response would include specific examples from your experience, clear actions taken, and measurable results achieved. Remember to stay focused on the question and provide concrete evidence of your skills and achievements.";
}

class InterviewPrep {
    async saveNotes() {
        try {
            // ... save notes logic ...
            toast.show('Notes saved successfully!', 'success');
        } catch (error) {
            toast.show('Failed to save notes', 'error');
        }
    }

    async generateQuestions() {
        try {
            // ... question generation logic ...
            toast.show('Interview questions generated!', 'success');
        } catch (error) {
            toast.show('Failed to generate questions', 'error');
        }
    }
} 