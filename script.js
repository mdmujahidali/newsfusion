// API key for News API (replace with your own key)
const apiKey = '0e674a7feee94b3b8c584b9bfe1d6e21';

// Elements from DOM
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('searchInput');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizScore = document.getElementById('quiz-score');
let synth = window.speechSynthesis;
let voices = [];
let currentUtterance = null;
let score = 0;
let currentQuestionIndex = 0;
let questions = [
  {
    question: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    correct: 'Paris'
  },
  {
    question: 'Who wrote "To Kill a Mockingbird"?',
    options: ['Harper Lee', 'Mark Twain', 'Ernest Hemingway', 'F. Scott Fitzgerald'],
    correct: 'Harper Lee'
  },
  {
    question: 'What is the largest planet in our Solar System?',
    options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
    correct: 'Jupiter'
  }
  // Add more questions as needed
];

// Fetch news by category
const fetchNews = async (category) => {
  try {
    const url = `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    const data = await response.json();
    displayNews(data.articles);
  } catch (error) {
    console.error('Error fetching news:', error);
  }
};

// Search news by keyword
const searchNews = async () => {
  const query = searchInput.value.trim();
  if (query) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to search news');
      }
      const data = await response.json();
      displayNews(data.articles);
    } catch (error) {
      console.error('Error searching news:', error);
    }
  }
};

// Display news articles
const displayNews = (articles) => {
  newsContainer.innerHTML = '';
  articles.forEach(article => {
    const newsArticle = document.createElement('div');
    newsArticle.classList.add('news-article');
    newsArticle.innerHTML = `
      <img src="${article.urlToImage ? article.urlToImage : 'placeholder.jpg'}" alt="${article.title}">
      <h2>${article.title}</h2>
      <p>${article.description ? article.description : ''}</p>
      <div class="social-sharing">
        <button onclick="shareOnFacebook('${article.url}')">Share on Facebook</button>
        <button onclick="shareOnTwitter('${article.url}')">Share on Twitter</button>
        <button onclick="readArticle('${article.title}', '${article.description}')">Read Article</button>
      </div>
    `;
    newsArticle.innerHTML += `
      <div class="feedback">
        <label for="feedback-${article.title}">Feedback:</label>
        <input type="text" id="feedback-${article.title}" name="feedback-${article.title}">
        <button onclick="submitFeedback('${article.title}')">Submit</button>
      </div>
      <button onclick="saveArticle('${article.title}', '${article.url}')">Save Article</button>
    `;
    newsContainer.appendChild(newsArticle);
  });
};

// Toggle dark mode
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});

// Function to share on Facebook
const shareOnFacebook = (url) => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
};

// Function to share on Twitter
const shareOnTwitter = (url) => {
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
};

// Function to read article with stop option
const readArticle = (title, content) => {
  // If there is an ongoing speech, stop it
  if (currentUtterance && synth.speaking) {
    synth.cancel();
    console.log('Speech stopped.');
    return;
  }

  let text = `${title}. ${content}`;
  console.log('Text to be read:', text);

  let utterance = new SpeechSynthesisUtterance(text);

  // Ensure voices are available and select the first one
  if (voices.length > 0) {
    utterance.voice = voices[0];
    console.log('Selected voice:', voices[0].name);
  } else {
    console.warn('No voices available.');
  }

  // Speak the utterance
  synth.speak(utterance);

  // Store the current utterance for later use
  currentUtterance = utterance;

  // Handle end event to clear currentUtterance
  utterance.onend = () => {
    currentUtterance = null;
    console.log('Speech ended.');
  };

  // Handle error event
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
  };
};

// Function to save an article
const saveArticle = (title, url) => {
  const savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];
  savedArticles.push({ title, url });
  localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
  alert('Article saved!');
};

// Function to display saved articles
const displaySavedArticles = () => {
  const savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];
  newsContainer.innerHTML = '';
  savedArticles.forEach(article => {
    const newsArticle = document.createElement('div');
    newsArticle.classList.add('news-article');
    newsArticle.innerHTML = `
      <h2>${article.title}</h2>
      <a href="${article.url}" target="_blank">Read more</a>
    `;
    newsContainer.appendChild(newsArticle);
  });
};

// Function to submit feedback
const submitFeedback = (title) => {
  const feedback = document.getElementById(`feedback-${title}`).value;
  console.log(`Feedback for ${title}: ${feedback}`);
  alert('Feedback submitted!');
};

// Quiz functions
const displayQuestion = () => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestionIndex = randomIndex;
  const question = questions[currentQuestionIndex];
  quizQuestion.textContent = question.question;
  quizOptions.innerHTML = '';
  question.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => checkAnswer(option);
    quizOptions.appendChild(button);
  });
};

const checkAnswer = (selectedOption) => {
  const question = questions[currentQuestionIndex];
  if (selectedOption === question.correct) {
    score++;
    alert('Correct!');
  } else {
    alert('Wrong!');
  }
  updateScore();
  displayQuestion();
};

const updateScore = () => {
  quizScore.textContent = `Score: ${score}`;
};

// Load voices when available
speechSynthesis.onvoiceschanged = () => {
  voices = synth.getVoices();
};

// Initial fetch example: Fetch technology news on page load
fetchNews('technology');
displayQuestion();
updateScore();
