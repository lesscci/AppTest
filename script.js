document.addEventListener("DOMContentLoaded", function() {
    let allQuestions = [];

    const match = window.location.pathname.match(/tema(\d+)\.html/);
const temaNumero = match ? match[1] : null;

if (temaNumero) {
    const jsonFile = `PREGUNTAS/preguntas-tema${temaNumero}.json`;

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

//Modal

const jsonPath = 'PREGUNTAS/preguntas-tema1.json'; 

// Función para mostrar el modal
function showModal(resultsText) {
    const modal = document.getElementById("resultModal");
    const resultDiv = document.getElementById("results");
    resultDiv.textContent = resultsText; // Asignar el contenido de los resultados al modal
    modal.style.display = "block"; // Mostrar el modal
}

// Función para cerrar el modal
const closeModal = document.getElementById("closeModal");
closeModal.onclick = function() {
    const modal = document.getElementById("resultModal");
    modal.style.display = "none"; // Cerrar el modal
}

// Lógica para comprobar respuestas y mostrar resultados en el modal
document.getElementById("checkAnswers").addEventListener("click", function() {
    // Aquí puedes agregar la lógica para comprobar las respuestas y generar los resultados
    const resultsText = "Tus resultados: 8 de 10 correctas."; // Ejemplo de resultados
    showModal(resultsText);
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