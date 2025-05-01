document.addEventListener("DOMContentLoaded", function() {
    let allQuestions = [];
    const temaNumero = window.location.pathname.match(/tema(\d+)\.html/)?.[1];

    // 1. Configuración inicial del modal
    function setupModal() {
        const closeModal = document.getElementById("closeModal");
        const modal = document.getElementById("resultModal");
        
        if (closeModal && modal) {
            closeModal.onclick = function() {
                modal.style.display = "none";
            };
            
            window.onclick = function(event) {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            };
        }
    }
    
    setupModal();

    // 2. Función para mostrar modal
    function showModal(content = "") {
        const modal = document.getElementById("resultModal");
        const resultsDiv = document.getElementById("results");
        
        if (modal && resultsDiv) {
            resultsDiv.innerHTML = content;
            modal.style.display = "block";
        }
    }

    // 3. Función para guardar respuestas incorrectas 
    function saveIncorrectAnswer(questionElement, userAnswer, temaNumero, allQuestions) {
        try {
            const questionText = questionElement.querySelector("p").textContent.replace(/^\d+\.\s/, "");
            const originalQuestion = allQuestions.find(q => q.question === questionText);
            
            if (!originalQuestion) {
                console.error("Pregunta original no encontrada");
                return;
            }
            
            const incorrectAnswers = JSON.parse(localStorage.getItem('incorrectAnswers')) || [];
            
            incorrectAnswers.push({
                question: originalQuestion.question,
                options: [...originalQuestion.options],
                answer: originalQuestion.answer,
                respuestaUsuario: userAnswer,
                tema: temaNumero ? `Tema ${temaNumero}` : "Sin tema",
                fecha: new Date().toLocaleString()
            });
            
            localStorage.setItem('incorrectAnswers', JSON.stringify(incorrectAnswers));
        } catch (error) {
            console.error("Error al guardar respuesta incorrecta:", error);
        }
    }

    // 4. Cargar preguntas
    if (temaNumero) {
        fetch(`../PREGUNTAS/preguntas-tema${temaNumero}.json`)
            .then(res => res.json())
            .then(data => {
                allQuestions = data;
                generateRandomTest();
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById("questionsContainer").textContent = 
                    "Error al cargar las preguntas. Por favor, recarga la página.";
            });
    }

    // 5. Generar test aleatorio
    function generateRandomTest() {
        const questionsContainer = document.getElementById("questionsContainer");
        if (!questionsContainer) return;
        
        questionsContainer.innerHTML = "";
        const randomQuestions = getRandomQuestions(allQuestions, 10);
        
        randomQuestions.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.className = "question";
            questionDiv.dataset.correctAnswer = question.answer.trim();
            
            const questionText = document.createElement("p");
            questionText.textContent = `${index + 1}. ${question.question}`;
            questionDiv.appendChild(questionText);

            const shuffledOptions = shuffleArray([...question.options]);
            
            shuffledOptions.forEach((option, i) => {
                const label = document.createElement("label");
                const input = document.createElement("input");
                input.type = "radio";
                input.name = `question${index}`;
                input.value = option;
                input.id = `answer-${index}-${i}`;

                label.htmlFor = input.id;
                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                
                questionDiv.appendChild(label);
                questionDiv.appendChild(document.createElement("br"));
            });
            
            questionsContainer.appendChild(questionDiv);
        });

        document.getElementById("checkAnswers").style.display = "block";
        document.getElementById("restartTest").style.display = "none";
        document.getElementById("results").innerHTML = "";
    }

    // 6. Manejar el evento de comprobar respuestas (único manejador)
    document.getElementById("checkAnswers")?.addEventListener("click", function() {
        // Primero verificamos si todas las preguntas están respondidas
        const questions = document.querySelectorAll(".question");
        let allAnswered = true;
        let unansweredQuestions = [];
        
        questions.forEach((question, index) => {
            const selectedAnswer = question.querySelector("input[type='radio']:checked");
            if (!selectedAnswer) {
                allAnswered = false;
                unansweredQuestions.push(index + 1); // Guardamos el número de pregunta
                question.style.border = "2px solid red"; // Resaltamos la pregunta no respondida
                setTimeout(() => question.style.border = "", 2000); // Quitamos el resaltado después de 2 segundos
            }
        });
        
        if (!allAnswered) {
            showModal(`
                <h3>Faltan respuestas</h3>
                <p>Por favor responde todas las preguntas antes de comprobar.</p>
                <p>Preguntas sin responder: ${unansweredQuestions.join(", ")}</p>
            `);
            return; // Salimos de la función si faltan respuestas
        }
        
        // Si todas están respondidas, procedemos con la comprobación
        const resultsDiv = document.getElementById("results");
        if (!resultsDiv) return;
        
        let correctAnswers = 0;
        let incorrectAnswersCount = 0;
        
        questions.forEach(questionElement => {
            const selectedAnswer = questionElement.querySelector("input[type='radio']:checked");
            const isCorrect = selectedAnswer.value.trim().toLowerCase() === 
                            questionElement.dataset.correctAnswer.trim().toLowerCase();
            
            if (isCorrect) {
                correctAnswers++;
                selectedAnswer.parentElement.style.color = "green";
            } else {
                incorrectAnswersCount++;
                selectedAnswer.parentElement.style.color = "red";
                saveIncorrectAnswer(questionElement, selectedAnswer.value, temaNumero, allQuestions);
            }
            
            // Mostrar respuesta correcta
            questionElement.querySelectorAll("input[type='radio']").forEach(option => {
                if (option.value.trim().toLowerCase() === questionElement.dataset.correctAnswer.trim().toLowerCase()) {
                    option.parentElement.style.fontWeight = "bold";
                    option.parentElement.style.color = "green";
                }
            });
        });
        
        // Mostrar resultados en el modal
        showModal(`
            <h3>Resultados</h3>
            <p>Respuestas correctas: ${correctAnswers} de ${questions.length}</p>
            ${incorrectAnswersCount > 0 ? 
                `<p>Se han guardado ${incorrectAnswersCount} respuestas incorrectas para revisión.</p>
                 <a href="incorrectas.html" style="color: blue;">Ver respuestas incorrectas</a>` : ''}
        `);
        
        document.getElementById("checkAnswers").style.display = "none";
        document.getElementById("restartTest").style.display = "block";
    });

    // 7. Funciones auxiliares
    function getRandomQuestions(questions, count) {
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }

    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 8. Reiniciar test
    document.getElementById("restartTest")?.addEventListener("click", generateRandomTest);
});