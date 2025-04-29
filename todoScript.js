document.addEventListener("DOMContentLoaded", function() {
    let allQuestions = [];
    const totalThemes = 10; // Cambia esto según cuántos temas tengas
    
    // Generar checkboxes para seleccionar temas
    const themeCheckboxes = document.getElementById("themeCheckboxes");
    for (let i = 1; i <= totalThemes; i++) {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `theme${i}`;
        checkbox.value = i;
        checkbox.checked = true; // Todos seleccionados por defecto
        
        const label = document.createElement('label');
        label.htmlFor = `theme${i}`;
        label.textContent = ` Tema ${i}`;
        
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        themeCheckboxes.appendChild(checkboxDiv);
    }
    
    // Función para cargar preguntas de los temas seleccionados
    async function loadSelectedThemes() {
        allQuestions = [];
        const checkboxes = document.querySelectorAll('#themeCheckboxes input[type="checkbox"]:checked');
        
        // Cargar todos los JSONs seleccionados en paralelo
        const promises = Array.from(checkboxes).map(checkbox => {
            const temaNumero = checkbox.value;
            const jsonFile = `PREGUNTAS/preguntas-tema${temaNumero}.json`;
            return fetch(jsonFile).then(res => res.json());
        });
        
        try {
            const results = await Promise.all(promises);
            allQuestions = results.flat(); // Combinar todos los arrays de preguntas
            return true;
        } catch (error) {
            console.error('Error cargando preguntas:', error);
            const questionsContainer = document.getElementById("questionsContainer");
            questionsContainer.textContent = "Error al cargar las preguntas. Por favor, recarga la página.";
            return false;
        }
    }
    
    // Botón para generar el test
    document.getElementById("generateTest").addEventListener("click", async function() {
        const loaded = await loadSelectedThemes();
        if (loaded) {
            const numQuestions = parseInt(document.getElementById("numQuestions").value);
            generateRandomTest(numQuestions);
        }
    });
    
    // Modal (igual que en tu código original)
    function showModal(resultsText) {
        const modal = document.getElementById("resultModal");
        const resultDiv = document.getElementById("results");
        resultDiv.textContent = resultsText;
        modal.style.display = "block";
    }
    
    const closeModal = document.getElementById("closeModal");
    closeModal.onclick = function() {
        const modal = document.getElementById("resultModal");
        modal.style.display = "none";
    }
    
    // Función para generar test con preguntas aleatorias 
    function generateRandomTest(count) {
        const questionsContainer = document.getElementById("questionsContainer");
        questionsContainer.innerHTML = "";
        
        const randomQuestions = getRandomQuestions(allQuestions, count);
        
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
        document.getElementById("generateTest").click();
    });
});