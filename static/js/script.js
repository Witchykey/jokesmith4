document.addEventListener('DOMContentLoaded', () => {
    const jokeForm = document.getElementById('jokeForm');
    const jokeTypeInput = document.getElementById('jokeType');
    const topicInput = document.getElementById('topic');
    const jokeText = document.getElementById('jokeText');
    const jokeCard = document.getElementById('jokeResult');
    const loader = document.getElementById('loadingIndicator');
  
    jokeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      // Hide previous joke and show loader
      jokeCard.classList.add('d-none');
      loader.classList.remove('d-none');
  
      const jokeType = jokeTypeInput.value;
      const topic = topicInput.value;
  
      try {
        const response = await fetch('/api/joke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            joke_type: jokeType,
            topic: topic
          })
        });
  
        if (!response.ok) {
          throw new Error('API returned error');
        }
  
        const data = await response.json();
        jokeText.textContent = data.joke.trim();
        jokeCard.classList.remove('d-none');
      } catch (error) {
        console.error(error);
        jokeText.textContent = "Oops! Something went wrong. Please try again.";
        jokeCard.classList.remove('d-none');
      } finally {
        loader.classList.add('d-none');
      }
    });
  });
  
  function copyJoke() {
    const jokeText = document.getElementById('jokeText').textContent;
    navigator.clipboard.writeText(jokeText).then(() => {
      alert("Joke copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy the joke.");
    });
  }
  