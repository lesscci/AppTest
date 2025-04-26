document.addEventListener("DOMContentLoaded", function() {
    let allQuestions = []; // Almacenará todas las preguntas combinadas
    
    // Cargar preguntas desde ambos archivos JSON
    Promise.all([
        fetch('preguntas-tema2.json').then(res => res.json()),
     //   fetch('preguntas-tema2.json').then(res => res.json()),
       // fetch('preguntas-tema3.json').then(res => res.json()),
    ])
    .then(([data1]) => {
        console.log("Preguntas cargadas:", data1);
        allQuestions = [...data1]; // Combina ambos arrays
        generateRandomTest();
    })
    .catch(error => {
        console.error('Error:', error);
        const questionsContainer = document.getElementById("questionsContainer");
        questionsContainer.textContent = "Error al cargar las preguntas. Por favor, recarga la página.";
    });

    // Función para generar test con preguntas aleatorias (el resto del código igual)
    function generateRandomTest() {
        const questionsContainer = document.getElementById("questionsContainer");
        questionsContainer.innerHTML = "";
        
        const randomQuestions = getRandomQuestions(allQuestions, 10);
        
        randomQuestions.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("question");
            
            const questionText = document.createElement("p");
            questionText.textContent = `${index + 1}. ${question.question}`;
            questionDiv.appendChild(questionText);

            const shuffledOptions = shuffleArray([...question.options]);
            
            shuffledOptions.forEach((option, i) => {
                const answerLabel = document.createElement("label");
                const answerInput = document.createElement("input");
                answerInput.type = "radio";
                answerInput.name = `question${index}`;
                answerInput.value = option;
                answerInput.id = `answer-${index}-${i}`;

                answerLabel.htmlFor = answerInput.id;
                answerLabel.appendChild(answerInput);
                answerLabel.appendChild(document.createTextNode(option));
                questionDiv.appendChild(answerLabel);
                
                questionDiv.appendChild(document.createElement("br"));
            });

            questionDiv.dataset.correctAnswer = question.answer.trim();
            questionsContainer.appendChild(questionDiv);
        });

        document.getElementById("checkAnswers").style.display = "block";
        document.getElementById("restartTest").style.display = "none";
        document.getElementById("results").innerHTML = "";
    }

    // Resto de funciones igual (getRandomQuestions, shuffleArray)
    function getRandomQuestions(questions, count) {
        if (questions.length <= count) return [...questions];
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Manejadores de eventos iguales
    document.getElementById("checkAnswers").addEventListener("click", function() {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";
        
        let correctAnswers = 0;
        const questions = document.querySelectorAll(".question");
        
        questions.forEach((question) => {
            const selectedAnswer = question.querySelector("input[type='radio']:checked");
            if (selectedAnswer) {
                const userAnswer = selectedAnswer.value.trim().toLowerCase();
                const correctAnswer = question.dataset.correctAnswer.trim().toLowerCase();
                
                if (userAnswer === correctAnswer) {
                    correctAnswers++;
                    selectedAnswer.parentElement.style.color = "green";
                } else {
                    selectedAnswer.parentElement.style.color = "red";
                }
            }
            
            const options = question.querySelectorAll("input[type='radio']");
            options.forEach(option => {
                if (option.value.trim().toLowerCase() === question.dataset.correctAnswer.trim().toLowerCase()) {
                    option.parentElement.style.fontWeight = "bold";
                    option.parentElement.style.color = "green";
                }
            });
        });

        resultsDiv.innerHTML = `
            <h3>Resultados</h3>
            <p>Respuestas correctas: <strong>${correctAnswers}</strong> de <strong>${questions.length}</strong></p>
            <p>Porcentaje: <strong>${Math.round((correctAnswers / questions.length) * 100)}%</strong></p>
        `;
        
        document.getElementById("checkAnswers").style.display = "none";
        document.getElementById("restartTest").style.display = "block";
    });

    document.getElementById("restartTest").addEventListener("click", function() {
        generateRandomTest();
    });
});