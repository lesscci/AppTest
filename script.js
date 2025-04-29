document.addEventListener("DOMContentLoaded", function() {
    let allQuestions = [];

    const match = window.location.pathname.match(/tema(\d+)\.html/);
const temaNumero = match ? match[1] : null;

if (temaNumero) {
    const jsonFile = `../PREGUNTAS/preguntas-tema${temaNumero}.json`;

    fetch(jsonFile)
        .then(res => res.json())
        .then(data => {
            allQuestions = [...data];
            generateRandomTest();
        })
        .catch(error => {
            console.error('Error:', error);
            const questionsContainer = document.getElementById("questionsContainer");
            questionsContainer.textContent = "Error al cargar las preguntas. Por favor, recarga la página.";
        });
}

// -----------------------------------------------------------//

//Modal
const jsonPath = '../PREGUNTAS/preguntas-tema1.json'; 

        // Función para mostrar el MODAL
        function showModal() {
            const modal = document.getElementById("resultModal");
            if (modal) {
                modal.style.display = "block";
            } else {
                console.error("Modal element not found!");
            }
        }
// Cerrar modal al hacer clic en la X
document.getElementById("closeModal").onclick = function() {
    const closeModal = document.getElementById("closeModal");
    if (closeModal) {
        closeModal.onclick = function() {
            const modal = document.getElementById("resultModal");
            if (modal) modal.style.display = "none";
        }
    } else {
        console.warn("Elemento closeModal no encontrado");
    }
}

  // Cerrar modal al hacer clic fuera del contenido
  window.onclick = function(event) {
    const modal = document.getElementById("resultModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// -----------------------------------------------------------//

// Función para guardar respuestas incorrectas
function saveIncorrectAnswer(questionElement, userAnswer, temaNumero, allQuestions) {
    let incorrectAnswers = JSON.parse(localStorage.getItem('incorrectAnswers')) || [];
    
    // Obtener el texto de la pregunta del DOM
    const questionText = questionElement.querySelector("p").textContent.replace(/^\d+\.\s/, "");
    
    // Buscar la pregunta completa en allQuestions
    const originalQuestion = allQuestions.find(q => q.question === questionText);
    
    if (!originalQuestion) {
        console.error("No se encontró la pregunta original:", questionText);
        return;
    }
    
    // Crear objeto con estructura correcta
    const incorrectQuestion = {
        question: originalQuestion.question,
        options: [...originalQuestion.options], // Copia las opciones
        answer: originalQuestion.answer,
        respuestaUsuario: userAnswer,
        tema: temaNumero ? `Tema ${temaNumero}` : "Sin tema",
        fecha: new Date().toLocaleString()
    };
    
    // Validación adicional
    if (!incorrectQuestion.question || !incorrectQuestion.answer || 
        !incorrectQuestion.options || !Array.isArray(incorrectQuestion.options)) {
        console.error("Estructura de pregunta inválida:", incorrectQuestion);
        return;
    }
    
    incorrectAnswers.push(incorrectQuestion);
    localStorage.setItem('incorrectAnswers', JSON.stringify(incorrectAnswers));
}

// Lógica para comprobar respuestas y mostrar resultados en el modal
document.getElementById("checkAnswers").addEventListener("click", function() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    
    let correctAnswers = 0;
    const questions = document.querySelectorAll(".question");
    let incorrectAnswersCount = 0;
    
    questions.forEach((question) => {
        const selectedAnswer = question.querySelector("input[type='radio']:checked");
        if (selectedAnswer) {
            const userAnswer = selectedAnswer.value.trim().toLowerCase();
            const correctAnswer = question.dataset.correctAnswer.trim().toLowerCase();
            const questionText = question.querySelector("p").textContent.replace(/^\d+\.\s/, "");
            
            if (userAnswer === correctAnswer) {
                correctAnswers++;
                selectedAnswer.parentElement.style.color = "green";
            } else {
                incorrectAnswersCount++;
                selectedAnswer.parentElement.style.color = "red";
                
                // Guardar respuesta incorrecta
                saveIncorrectAnswer(
                    questionText,
                    userAnswer,
                    correctAnswer,
                    temaNumero,
                    question 
                );
            }
        }
        
        // Mostrar la respuesta correcta
        const options = question.querySelectorAll("input[type='radio']");
        options.forEach(option => {
            if (option.value.trim().toLowerCase() === question.dataset.correctAnswer.trim().toLowerCase()) {
                option.parentElement.style.fontWeight = "bold";
                option.parentElement.style.color = "green";
            }
        });
    });

    // Mostrar resultados en el modal
    resultsDiv.innerHTML = `
        <h3>Resultados</h3>
        <p>Respuestas correctas: <strong>${correctAnswers}</strong> de <strong>${questions.length}</strong></p>
        <p>Porcentaje: <strong>${Math.round((correctAnswers / questions.length) * 100)}%</strong></p>
        ${incorrectAnswersCount > 0 ? 
          `<p>Se han guardado <strong>${incorrectAnswersCount}</strong> respuestas incorrectas para revisión.</p>
           <a href="incorrectas.html" style="color: blue; text-decoration: underline;">Ver respuestas incorrectas</a>` 
          : ''}
    `;
    
    showModal();
    document.getElementById("checkAnswers").style.display = "none";
    document.getElementById("restartTest").style.display = "block";
});

    // Función para generar test con preguntas aleatorias 
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

    document.getElementById("checkAnswers").addEventListener("click", function() {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";
        
        let correctAnswers = 0;
        const questions = document.querySelectorAll(".question");
        let incorrectAnswersCount = 0;
        
        questions.forEach((questionElement) => {
            const selectedAnswer = questionElement.querySelector("input[type='radio']:checked");
            if (selectedAnswer) {
                const userAnswer = selectedAnswer.value;
                const correctAnswer = questionElement.dataset.correctAnswer;
                
                if (userAnswer === correctAnswer) {
                    correctAnswers++;
                    selectedAnswer.parentElement.style.color = "green";
                } else {
                    incorrectAnswersCount++;
                    selectedAnswer.parentElement.style.color = "red";
                    
                    // Guardar respuesta incorrecta con la estructura correcta
                    saveIncorrectAnswer(questionElement, userAnswer, temaNumero, allQuestions);
                }
            }
        });
        
        // Resto de tu lógica para mostrar resultados...
    });

    document.getElementById("restartTest").addEventListener("click", function() {
        generateRandomTest();
    });

  


});